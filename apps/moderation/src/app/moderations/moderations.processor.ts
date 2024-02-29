import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AsyncLocalStorageService } from '@ticketing/microservices/shared/async-local-storage';
import { MailerService } from '@ticketing/microservices/shared/mailer';
import {
  Moderation,
  ModerationStatus,
  TicketStatus,
} from '@ticketing/shared/models';
import type { Job } from 'bullmq';

import {
  ContentGuardService,
  IOpenAIModerationResponse,
} from '../content-guard/content-guard.service';
import type { AppConfigService } from '../env';
import {
  EventsMap,
  TICKET_APPROVED_EVENT,
  TICKET_MANUAL_REVIEW_REQUIRED_EVENT,
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
    @Inject(ConfigService) private readonly configService: AppConfigService,
    @Inject(MailerService) private readonly mailerService: MailerService,
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
    const { status, rejectionReason } = await this.moderateTicket(job.data);
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
          moderation: {
            ...moderation,
            status: ModerationStatus.Rejected,
            rejectionReason,
          },
          ticket: { ...ticket, status: TicketStatus.Rejected },
        });
        break;
      case ModerationStatus.RequiresManualReview:
        await this.emitEventAsync(TICKET_MANUAL_REVIEW_REQUIRED_EVENT, {
          ctx,
          moderation: {
            ...moderation,
            status: ModerationStatus.RequiresManualReview,
            rejectionReason,
          },
          ticket: { ...ticket, status: TicketStatus.WaitingModeration },
        });
        await this.sendModerationEmail(ticket, {
          ...moderation,
          status: ModerationStatus.RequiresManualReview,
          rejectionReason,
        });
        break;
      default:
        break;
    }
    return { status };
  }

  private get categoryThresholds(): IOpenAIModerationResponse['results'][0]['category_scores'] {
    return {
      hate: this.configService.get('MODERATION_HATE_THRESHOLD'),
      'hate/threatening': this.configService.get(
        'MODERATION_HATE_THREATENING_THRESHOLD',
      ),
      harassment: this.configService.get('MODERATION_HARASSMENT_THRESHOLD'),
      'harassment/threatening': this.configService.get(
        'MODERATION_HARASSMENT_THREATENING_THRESHOLD',
      ),
      'self-harm': this.configService.get('MODERATION_SELF_HARM_THRESHOLD'),
      'self-harm/intent': this.configService.get(
        'MODERATION_SELF_HARM_INTENT_THRESHOLD',
      ),
      'self-harm/instructions': this.configService.get(
        'MODERATION_SELF_HARM_INSTRUCTIONS_THRESHOLD',
      ),
      sexual: this.configService.get('MODERATION_SEXUAL_THRESHOLD'),
      'sexual/minors': this.configService.get(
        'MODERATION_SEXUAL_MINORS_THRESHOLD',
      ),
      violence: this.configService.get('MODERATION_VIOLENCE_THRESHOLD'),
      'violence/graphic': this.configService.get(
        'MODERATION_VIOLENCE_GRAPHIC_THRESHOLD',
      ),
    };
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

    const {
      flagged,
      categories,
      category_scores: scores,
    } = await this.contentGuardService.isFlagged(ticket.title);
    this.logger.debug(
      `Ticket: ${ticket.title} is ${
        flagged ? 'flagged' : 'not flagged'
      } by OpenAI`,
    );
    if (flagged) {
      const thresholdConfig = this.categoryThresholds;
      const uncertainCategories = Object.entries(scores).filter(
        ([category, score]) => score < thresholdConfig[category],
      );
      if (uncertainCategories.length) {
        const rejectionReason = `Ticket title classification requires manual review : ${uncertainCategories
          .map(([category]) => category)
          .join(', ')}`;
        this.logger.debug(rejectionReason);
        return {
          status: ModerationStatus.RequiresManualReview,
          rejectionReason,
        };
      }

      const flaggedCategories = Object.entries(categories)
        .filter((category) => category[1])
        .map(([category]) => category);
      const rejectionReason = `Ticket title contains inappropriate language in categories: ${flaggedCategories.join(
        ', ',
      )}`;
      this.logger.debug(rejectionReason);
      return { status: ModerationStatus.Rejected, rejectionReason };
    }

    return Promise.resolve({ status: ModerationStatus.Approved });
  }

  private async sendModerationEmail(
    ticket: ModerateTicket['ticket'],
    moderation: Moderation,
  ): Promise<void> {
    const recipients = this.configService.get('MODERATORS_EMAILS', {
      infer: true,
    });
    if (!recipients.length) {
      return Promise.resolve();
    }
    const html = await this.mailerService.renderTemplate(
      'moderation-required.hbs',
      {
        moderationId: moderation.id,
        title: ticket.title,
        ticketId: ticket.id,
        reason: moderation.rejectionReason,
      },
    );
    await this.mailerService.sendMail(recipients, 'Moderation Required', html);
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
