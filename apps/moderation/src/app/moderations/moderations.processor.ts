import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AsyncLocalStorageService } from '@ticketing/microservices/shared/async-local-storage';
import { ModerationStatus, TicketStatus } from '@ticketing/shared/models';
import type { Job } from 'bullmq';

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
  ) {
    super();
  }

  private async emitEventAsync<T extends keyof EventsMap>(
    eventName: T,
    event: EventsMap[T],
  ): Promise<void> {
    await this.eventEmitter.emitAsync(eventName, event);
  }

  async process(
    job: Job<ModerateTicket>,
  ): Promise<{ status: ModerationStatus }> {
    const { ctx, ticket, moderation } = job.data;
    this.asyncLocalStorageService.enter();
    this.asyncLocalStorageService.set('REQUEST_CONTEXT', ctx);
    const { status } = await this.moderateTicket(job.data);
    switch (status) {
      case ModerationStatus.Approved:
        await this.emitEventAsync(TICKET_APPROVED_EVENT, {
          ctx,
          moderation: { ...moderation, status: ModerationStatus.Approved },
          ticket: { ...ticket, status: TicketStatus.Approved },
        });
        break;
      case ModerationStatus.Rejected:
        await this.emitEventAsync(TICKET_REJECTED_EVENT, {
          ctx,
          moderation: { ...moderation, status: ModerationStatus.Rejected },
          ticket: { ...ticket, status: TicketStatus.Rejected },
        });
        break;
      // TODO: create another status for moderation requiring human intervention
      case ModerationStatus.Pending:
        // TODO: notify moderation team
        break;
      default:
        break;
    }
    return { status };
  }

  // TODO: implement moderation logic
  private moderateTicket(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    jobData: ModerateTicket,
  ): Promise<{ status: ModerationStatus; rejectionReason?: string }> {
    return Promise.resolve({ status: ModerationStatus.Pending });
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
