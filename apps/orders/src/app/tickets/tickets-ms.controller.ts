import { Controller, Inject, Logger, ValidationPipe } from '@nestjs/common';
import { Ctx, EventPattern, Payload, Transport } from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { NatsStreamingContext } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { Patterns } from '@ticketing/microservices/shared/events';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { Ticket } from '@ticketing/shared/models';

import { TicketsService } from './tickets.service';

@Controller()
export class TicketsMSController {
  readonly logger = new Logger(TicketsMSController.name);

  constructor(
    @Inject(TicketsService) private readonly ticketsService: TicketsService
  ) {}

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
    data: Ticket,
    @Ctx() context: NatsStreamingContext
  ): Promise<void> {
    this.logger.verbose(`received message on ${context.message.getSubject()}`, {
      data,
    });
    await this.ticketsService.create(data);
    context.message.ack();
  }

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
    data: Ticket,
    @Ctx() context: NatsStreamingContext
  ): Promise<void> {
    this.logger.verbose(`received message on ${context.message.getSubject()}`, {
      data,
    });
    await this.ticketsService.updateById(data.id, data);
    context.message.ack();
  }
}
