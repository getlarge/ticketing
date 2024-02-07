import { OryError, OryRelationshipsService } from '@getlarge/keto-client-wrapper';
import {
  createRelationQuery,
  relationTupleBuilder,
} from '@getlarge/keto-relations-parser';
import { InjectQueue } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { PermissionNamespaces } from '@ticketing/microservices/shared/models';
import { transactionManager } from '@ticketing/microservices/shared/mongo';
import { Resources } from '@ticketing/shared/constants';
import {
  AcceptableError,
  GenericError,
  RecoverableError,
  UnidentifiedError,
} from '@ticketing/shared/errors';
import {
  Moderation,
  ModerationStatus,
  TicketStatus,
} from '@ticketing/shared/models';
import { Queue } from 'bullmq';
import type { Cache } from 'cache-manager';
import { MongoNetworkError, MongoServerClosedError } from 'mongodb';
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
    @Inject(OryRelationshipsService)
    private readonly oryRelationshipsService: OryRelationshipsService,
    @InjectQueue(QueueNames.MODERATE_TICKET)
    private readonly moderationProcessor: Queue<ModerateTicket>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private emitEventAsync<T extends keyof EventsMap>(
    eventName: T,
    event: EventsMap[T],
  ): Promise<unknown> {
    return this.eventEmitter.emitAsync(eventName, event);
  }

  async find(params: FilterModerationsDto = {}): Promise<Moderation[]> {
    const moderations = await this.moderationModel.find({
      ...(params?.status && { status: params.status }),
    });
    return moderations.map((moderation) => moderation.toJSON<Moderation>());
  }

  findById(id: string): Promise<Moderation> {
    return this.cacheManager.wrap(
      `moderation:${id}`,
      async () => {
        const moderation = await this.moderationModel
          .findOne({
            _id: id,
          })
          .populate('ticket');
        if (!moderation) {
          throw new NotFoundException(`Moderation not found - ${id}`);
        }
        return moderation.toJSON<Moderation>();
      },
      (moderation) => {
        switch (moderation?.status) {
          case ModerationStatus.Approved:
          case ModerationStatus.Rejected:
            return 60 * 1000;
          case ModerationStatus.Pending:
          case ModerationStatus.RequiresManualReview:
          default:
            return 5 * 1000;
        }
      },
    );
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

    try {
      await manager.wrap(async (session) => {
        const existingModeration = await this.moderationModel
          .findOne({
            'ticket.$id': event.ticket.id,
          })
          .session(session);
        if (existingModeration?.id) {
          // TODO: check whether moderation is pending,
          throw new AcceptableError(
            `Ticket moderation already exists - ${existingModeration.id}`,
            HttpStatus.BAD_REQUEST,
            TICKET_CREATED_EVENT,
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

        const relationTupleWithAdminGroup = relationTupleBuilder()
          .subject(PermissionNamespaces[Resources.GROUPS], 'admin', 'members')
          .isIn('editors')
          .of(PermissionNamespaces[Resources.MODERATIONS], moderation.id);

        const createRelationshipBody = createRelationQuery(
          relationTupleWithAdminGroup.toJSON(),
        ).unwrapOrThrow();
        await this.oryRelationshipsService.createRelationship({
          createRelationshipBody,
        });
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
    } catch (e) {
      if (e instanceof GenericError) {
        throw e;
      }
      if (
        e instanceof MongoNetworkError ||
        e instanceof MongoServerClosedError
      ) {
        throw new RecoverableError(
          e.message,
          HttpStatus.SERVICE_UNAVAILABLE,
          TICKET_CREATED_EVENT,
        );
      }
      if (e instanceof OryError) {
        this.logger.error(e.getDetails());
        throw new AcceptableError(
          `Could not create relation`,
          HttpStatus.BAD_REQUEST,
          TICKET_CREATED_EVENT,
        );
      }
      throw new UnidentifiedError(
        e.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        TICKET_CREATED_EVENT,
      );
    }
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
