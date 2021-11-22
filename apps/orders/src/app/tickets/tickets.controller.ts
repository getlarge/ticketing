import { Controller, Inject, Logger, ValidationPipe } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { NatsStreamingContext } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import {
  Patterns,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from '@ticketing/microservices/shared/events';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';

import { TicketsService } from './tickets.service';

@Controller()
export class TicketsController {
  readonly logger = new Logger(TicketsController.name);

  constructor(
    @Inject(TicketsService) private readonly ticketsService: TicketsService
  ) {}

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.TicketCreated)
  async onCreated(
    @Payload(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: requestValidationErrorFactory,
        forbidUnknownValues: true,
        whitelist: true,
      })
    )
    data: TicketCreatedEvent['data'],
    @Ctx() context: NatsStreamingContext
  ): Promise<void> {
    this.logger.log(`received message on ${context.getArgByIndex(0)}`, {
      data,
    });
    try {
      await this.ticketsService.create(data);
    } catch (err) {
      this.logger.error(err);
    } finally {
      context.message.ack();
    }
  }

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.TicketUpdated)
  async onUpdated(
    @Payload(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: requestValidationErrorFactory,
        forbidUnknownValues: true,
        whitelist: true,
      })
    )
    data: TicketUpdatedEvent['data'],
    @Ctx() context: NatsStreamingContext
  ): Promise<void> {
    this.logger.log(`received message on ${context.getArgByIndex(0)}`, {
      data,
    });
    try {
      await this.ticketsService.updateById(data.id, data);
    } catch (err) {
      this.logger.error(err);
    } finally {
      context.message.ack();
    }
  }
}
