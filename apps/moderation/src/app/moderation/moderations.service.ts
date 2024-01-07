import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { OryPermissionsService } from '@ticketing/microservices/ory-client';
import { PermissionNamespaces } from '@ticketing/microservices/shared/models';
import { transactionManager } from '@ticketing/microservices/shared/mongo';
import { RelationTuple } from '@ticketing/microservices/shared/relation-tuple-parser';
import { Resources } from '@ticketing/shared/constants';
import {
  Moderation,
  ModerationStatus,
  TicketStatus,
} from '@ticketing/shared/models';
import { Queue } from 'bullmq';
import { Model, Types } from 'mongoose';

import {
  type TicketApprovedEvent,
  type TicketCreatedEvent,
  type TicketManualReviewRequiredEvent,
  type TicketRejectedEvent,
  EventsMap,
  TICKET_APPROVED_EVENT,
  TICKET_CREATED_EVENT,
  TICKET_MANUAL_REVIEW_REQUIRED_EVENT,
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
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject(OryPermissionsService)
    private readonly oryPermissionsService: OryPermissionsService,
    @InjectQueue(QueueNames.MODERATE_TICKET)
    private readonly moderationProcessor: Queue<ModerateTicket>,
  ) {}

  private emitEventAsync<T extends keyof EventsMap>(
    eventName: T,
    event: EventsMap[T],
  ): Promise<unknown> {
    return this.eventEmitter.emitAsync(eventName, event);
  }

  async find(params: FilterModerationsDto = {}): Promise<Moderation[]> {
    // TODO: use Paginator from nestjs-keyset-paginator
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

  async approveById(id: string): Promise<Moderation> {
    const moderation = await this.findById(id);
    await this.emitEventAsync(TICKET_APPROVED_EVENT, {
      moderation: { ...moderation, status: ModerationStatus.Approved },
      ticket: { ...moderation.ticket, status: TicketStatus.Approved },
      ctx: {},
    });
    return { ...moderation, status: ModerationStatus.Approved };
  }

  async rejectById(id: string, rejectionReason: string): Promise<Moderation> {
    const moderation = await this.findById(id);
    await this.emitEventAsync(TICKET_REJECTED_EVENT, {
      moderation: {
        ...moderation,
        status: ModerationStatus.Rejected,
        rejectionReason,
      },
      ticket: { ...moderation.ticket, status: TicketStatus.Rejected },
      ctx: {},
    });
    return {
      ...moderation,
      status: ModerationStatus.Rejected,
      rejectionReason,
    };
  }

  @OnEvent(TICKET_CREATED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketCreated(event: TicketCreatedEvent): Promise<void> {
    this.logger.log(`onTicketCreated ${JSON.stringify(event)}`);
    await using manager = await transactionManager(this.moderationModel);
    await manager.wrap(async (session) => {
      const existingModeration = await this.moderationModel.findOne({
        'ticket.$id': event.ticket.id,
      });
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

      const relationTupleWithAdminGroup = new RelationTuple(
        PermissionNamespaces[Resources.MODERATIONS],
        moderation.id,
        'editors',
        {
          namespace: PermissionNamespaces[Resources.GROUPS],
          object: 'admin',
          relation: 'members',
        },
      );
      const relationCreated = await this.oryPermissionsService.createRelation(
        relationTupleWithAdminGroup,
      );
      if (!relationCreated) {
        throw new Error(
          `Could not create relation ${relationTupleWithAdminGroup.toString()}`,
        );
      }
      this.logger.debug(
        `Created relation ${relationTupleWithAdminGroup.toString()}`,
      );

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
      rejectionReason: undefined,
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
      rejectionReason: event.moderation.rejectionReason,
    });
  }

  @OnEvent(TICKET_MANUAL_REVIEW_REQUIRED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketManualReviewRequired(
    event: TicketManualReviewRequiredEvent,
  ): Promise<void> {
    this.logger.log(`onTicketManualReviewRequired ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.RequiresManualReview,
      rejectionReason: event.moderation.rejectionReason,
    });
  }
}
