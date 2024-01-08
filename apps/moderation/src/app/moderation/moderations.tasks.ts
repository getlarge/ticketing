import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LockService } from '@s1seven/nestjs-tools-lock';
import type { Queue } from 'bullmq';
import type { Model } from 'mongoose';
import type { Lock } from 'redlock';

import { ModerateTicket, QueueNames } from '../shared/queues';
import { Moderation, ModerationDocument } from './schemas';

@Injectable()
export class ModerationsTasks {
  readonly logger = new Logger(ModerationsTasks.name);

  constructor(
    @Inject(LockService) private readonly lockService: LockService,
    @InjectModel(Moderation.name)
    private moderationModel: Model<ModerationDocument>,
    @InjectQueue(QueueNames.MODERATE_TICKET)
    private readonly moderationProcessor: Queue<ModerateTicket>,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkPendingModerations(): Promise<void> {
    const lockKey = 'checkPendingModerations';
    this.logger.verbose('creating lock for checkPendingModerations...');
    let lock: Lock = await this.lockService.lock(lockKey, 2000);
    // if the lock is not released, we don't want to continue
    if (typeof lock.release !== 'function') {
      return;
    }
    this.logger.debug('checking pending moderations...');
    try {
      const pendingModerations = await this.moderationModel
        .find({
          status: 'pending',
          // only check moderations that are more than 10 seconds old
          $where: function () {
            return new Date(Date.now() - 10000) > this._id.getTimestamp();
          },
        })
        .populate('ticket');

      this.logger.debug(
        `Found ${pendingModerations.length} pending moderations.`,
      );
      if (pendingModerations.length > 0) {
        lock = await lock.extend(5000);
      }
      for (const pendingModeration of pendingModerations) {
        const moderation = pendingModeration.toJSON<Moderation>();
        await this.moderationProcessor
          .getJob(moderation.id)
          .then(async (job) => {
            if (job) {
              const state = await job.getState();
              this.logger.debug(`Job ${moderation.id} is ${state}`);
              return job;
            }
            return this.moderationProcessor.add(
              'moderate-ticket',
              {
                ticket: pendingModeration.ticket.toJSON(),
                ctx: {},
                moderation,
              },
              {
                attempts: 1,
                delay: 1000,
                jobId: moderation.id,
                removeOnComplete: true,
                removeOnFail: true,
              },
            );
          });
      }
    } finally {
      await lock.release();
    }
  }
}
