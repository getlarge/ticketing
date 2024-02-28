import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { transactionManager } from '@ticketing/microservices/shared/mongo';
import { Moderation, ModerationStatus } from '@ticketing/shared/models';
import { Queue } from 'bullmq';
import { Model,Types } from 'mongoose';

import {
  type TicketApprovedEvent,
  type TicketCreatedEvent,
  type TicketRejectedEvent,
  TICKET_APPROVED_EVENT,
  TICKET_CREATED_EVENT,
  TICKET_REJECTED_EVENT,
} from '../shared/events';
import { ModerateTicket, QueueNames } from '../shared/queues';
import { FilterModerationsDto, UpdateModerationDto } from './models';
import { Moderation as ModerationSchema, ModerationDocument } from './schemas';

@Injectable()
export class ModerationsService {
  private readonly logger = new Logger(ModerationsService.name);

  constructor(
    @InjectModel(ModerationSchema.name)
    private moderationModel: Model<ModerationDocument>,
    @InjectQueue(QueueNames.MODERATE_TICKET)
    private readonly moderationProcessor: Queue<ModerateTicket>,
  ) {}

  @OnEvent(TICKET_CREATED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketCreated(event: TicketCreatedEvent): Promise<void> {
    this.logger.log(`onTicketCreated ${JSON.stringify(event)}`);
    await using manager = await transactionManager(this.moderationModel);
    await manager.wrap(async (session) => {
      const existingModeration = await this.moderationModel
        .findOne({
          'ticket.$id': event.ticket.id,
        })
        .session(session);
      if (existingModeration) {
        // TODO: check whether moderation is pending,
        throw new Error(
          `Ticket moderation already exists - ${existingModeration.id}`,
        );
      }
      const res = await this.moderationModel.create(
        [
          {
            ticket: Types.ObjectId.createFromHexString(event.ticket.id),
            status: ModerationStatus.Pending,
          },
        ],
        { session },
      );
      await res[0].populate('ticket');
      const moderation = res[0].toJSON<Moderation>();
      this.logger.debug(`Created moderation ${moderation.id}`);

      const job = await this.moderationProcessor.add(
        'moderate-ticket',
        { ticket: event.ticket, ctx: event.ctx, moderation },
        {
          attempts: 2,
          delay: 1000,
          jobId: moderation.id,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
      this.logger.debug(`Created job ${job.id}`);
      return moderation;
    });
  }

  @OnEvent(TICKET_APPROVED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketApproved(event: TicketApprovedEvent): Promise<void> {
    this.logger.log(`onTicketApproved ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.Approved,
    });
  }

  @OnEvent(TICKET_REJECTED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketRejected(event: TicketRejectedEvent): Promise<void> {
    this.logger.log(`onTicketRejected ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.Rejected,
    });
  }

  async find(params: FilterModerationsDto = {}): Promise<Moderation[]> {
    const moderations = await this.moderationModel.find({
      ...(params?.status && { status: params.status }),
    });
    return moderations.map((moderation) => moderation.toJSON<Moderation>());
  }

  async findById(id: string): Promise<Moderation> {
    const moderation = await this.moderationModel
      .findOne({
        _id: id,
      })
      .populate('ticket');

    if (!moderation) {
      throw new NotFoundException(`Moderation not found - ${id}`);
    }
    return moderation.toJSON<Moderation>();
  }

  async updateById(
    id: string,
    update: UpdateModerationDto,
  ): Promise<Moderation> {
    const existingModeration = await this.moderationModel.findOne({
      _id: id,
    });
    existingModeration.set(update);
    const moderation = await existingModeration.save();
    await moderation.populate('ticket');
    return moderation.toJSON<Moderation>();
  }
}
