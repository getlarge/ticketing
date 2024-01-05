import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AsyncLocalStorageService } from '@ticketing/microservices/shared/async-local-storage';
import { ModerationStatus, TicketStatus } from '@ticketing/shared/models';
import type { Job } from 'bullmq';

import { ContentGuardService } from '../content-guard/content-guard.service';
import {
  EventsMap,
  TICKET_APPROVED_EVENT,
  TICKET_REJECTED_EVENT,
} from '../shared/events';
import { ModerateTicket, QueueNames } from '../shared/queues';

@Processor(QueueNames.MODERATE_TICKET)
export class ModerationsProcessor extends WorkerHost {
  readonly logger = new Logger(ModerationsProcessor.name);

  constructor(
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject(AsyncLocalStorageService)
    private readonly asyncLocalStorageService: AsyncLocalStorageService,
    @Inject(ContentGuardService)
    private readonly contentGuardService: ContentGuardService,
  ) {
    super();
  }

  private emitEvent<T extends keyof EventsMap>(
    eventName: T,
    event: EventsMap[T],
  ): void {
    this.eventEmitter.emit(eventName, event);
  }

  async process(
    job: Job<ModerateTicket>,
  ): Promise<{ status: ModerationStatus }> {
    const { ctx, ticket, moderation } = job.data;
    this.asyncLocalStorageService.enter();
    this.asyncLocalStorageService.set('REQUEST_CONTEXT', ctx);
    const { status, rejectionReason } = await this.moderateTicket(job.data);
    switch (status) {
      case ModerationStatus.Approved:
        this.emitEvent(TICKET_APPROVED_EVENT, {
          ctx,
          moderation: {
            ...moderation,
            status: ModerationStatus.Approved,
          },
          ticket: { ...ticket, status: TicketStatus.Approved },
        });
        break;
      case ModerationStatus.Rejected:
        this.emitEvent(TICKET_REJECTED_EVENT, {
          ctx,
          moderation: {
            ...moderation,
            status: ModerationStatus.Rejected,
            rejectionReason,
          },
          ticket: { ...ticket, status: TicketStatus.Rejected },
        });
        break;
      // TODO: create another status for moderation requiring human intervention
      case ModerationStatus.Pending:
        //  TODO: notify moderation team
        break;
      default:
        break;
    }
    return { status };
  }

  private async moderateTicket(
    jobData: ModerateTicket,
  ): Promise<{ status: ModerationStatus; rejectionReason?: string }> {
    const { ticket } = jobData;
    const isMatched = this.contentGuardService.matchesDictionary(ticket.title);
    this.logger.debug(
      `Ticket: ${ticket.title} is ${
        isMatched ? 'matched' : 'not matched'
      } with dictionary`,
    );
    if (isMatched) {
      const rejectionReason = `Ticket title contains inappropriate language`;
      return { status: ModerationStatus.Rejected, rejectionReason };
    }

    const result = await this.contentGuardService.isFlagged(ticket.title);
    this.logger.debug(
      `Ticket: ${ticket.title} is ${
        result.flagged ? 'flagged' : 'not flagged'
      } by OpenAI`,
    );
    if (result.flagged) {
      const flaggedCategories = Object.entries(result.categories)
        .filter(([, flagged]) => flagged)
        .map(([category]) => category);
      const rejectionReason = `Ticket title contains inappropriate language in categories: ${flaggedCategories.join(
        ', ',
      )}`;
      this.logger.debug(rejectionReason);
      return { status: ModerationStatus.Rejected, rejectionReason };
    }

    return Promise.resolve({ status: ModerationStatus.Approved });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<ModerateTicket>): void {
    this.logger.log(`Job: ${QueueNames.MODERATE_TICKET}-${job.id} completed`);
    this.asyncLocalStorageService.exit();
  }

  @OnWorkerEvent('error')
  onError(error: Error): void {
    this.logger.error(
      error,
      `Job: ${QueueNames.MODERATE_TICKET} errored : ${error.message}`,
    );
    this.asyncLocalStorageService.exit();
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ModerateTicket>, error: Error): void {
    const { failedReason } = job;
    this.logger.error(
      error,
      `Job: ${QueueNames.MODERATE_TICKET}-${job.id} failed : ${failedReason}`,
    );
    this.asyncLocalStorageService.exit();
  }
}
