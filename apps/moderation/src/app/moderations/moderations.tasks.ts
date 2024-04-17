import { LockService } from '@getlarge/nestjs-tools-lock';
import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SchedulerRegistry, Timeout } from '@nestjs/schedule';
import type { Queue } from 'bullmq';
import type { Model } from 'mongoose';
import { type Lock, ExecutionError, ResourceLockedError } from 'redlock';

import { ModerateTicket, QueueNames } from '../shared/queues';
import { Moderation, ModerationDocument } from './schemas';

@Injectable()
export class ModerationsTasks {
  readonly logger = new Logger(ModerationsTasks.name);

  constructor(
    @Inject(LockService) private readonly lockService: LockService,
    @Inject(SchedulerRegistry) private schedulerRegistry: SchedulerRegistry,
    @InjectModel(Moderation.name)
    private moderationModel: Model<ModerationDocument>,
    @InjectQueue(QueueNames.MODERATE_TICKET)
    private readonly moderationProcessor: Queue<ModerateTicket>,
  ) {}

  @Timeout('checkPendingModerations', 5000)
  async checkPendingModerations(): Promise<void> {
    const taskKey = 'checkPendingModerations';
    this.logger.verbose(`creating lock for ${taskKey}`);
    let lock: Lock = await this.lockService
      .lock(taskKey, 2000)
      .catch(async (err) => {
        // improve error handling as suggested in https://github.com/mike-marcacci/node-redlock/issues/288
        let isAlreadyLocked = err instanceof ResourceLockedError;
        if (err instanceof ExecutionError && err.attempts.length) {
          const attemptError = (await err.attempts.at(0)).votesAgainst
            .values()
            .next().value;
          isAlreadyLocked = attemptError instanceof ResourceLockedError;
        }
        if (!isAlreadyLocked) {
          throw err;
        }
        return null;
      });
    // if the lock is not released, we don't want to continue
    if (typeof lock?.release !== 'function') {
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
      const timeout = this.schedulerRegistry.getTimeout(
        taskKey,
      ) as NodeJS.Timeout;
      timeout.refresh();
      await lock.release();
    }
  }
}
