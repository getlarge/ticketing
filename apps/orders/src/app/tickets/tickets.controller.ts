import {
  Controller,
  Inject,
  Logger,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { Ctx, EventPattern, Payload, Transport } from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { NatsStreamingContext } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import {
  Patterns,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from '@ticketing/microservices/shared/events';
import { NatsStreamErrorFilter } from '@ticketing/microservices/shared/filters';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';

import { TicketsService } from './tickets.service';

@Controller()
export class TicketsController {
  readonly logger = new Logger(TicketsController.name);

  constructor(
    @Inject(TicketsService) private readonly ticketsService: TicketsService
  ) {}

  @UseFilters(NatsStreamErrorFilter)
  @ApiExcludeEndpoint()
  @EventPattern(Patterns.TicketCreated, Transport.NATS)
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
    this.logger.log(`received message on ${context.message.getSubject()}`, {
      data,
    });
    await this.ticketsService.create(data);
    context.message.ack();
  }

  @UseFilters(NatsStreamErrorFilter)
  @ApiExcludeEndpoint()
  @EventPattern(Patterns.TicketUpdated, Transport.NATS)
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
    this.logger.log(`received message on ${context.message.getSubject()}`, {
      data,
    });
    await this.ticketsService.updateById(data.id, data);
    context.message.ack();
  }
}
