import { Controller, Inject, Logger, ValidationPipe } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  Transport,
} from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Patterns } from '@ticketing/microservices/shared/events';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { Ticket } from '@ticketing/shared/models';
import type { Channel } from 'amqp-connection-manager';
import type { Message } from 'amqplib';

import { TicketsService } from './tickets.service';

@Controller()
export class TicketsMSController {
  readonly logger = new Logger(TicketsMSController.name);

  constructor(
    @Inject(TicketsService) private readonly ticketsService: TicketsService,
  ) {}

  @ApiExcludeEndpoint()
  @MessagePattern(Patterns.TicketCreated, Transport.RMQ)
  async onCreated(
    @Payload(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: requestValidationErrorFactory,
        forbidUnknownValues: true,
        whitelist: true,
      }),
    )
    data: Ticket,
    @Ctx() context: RmqContext,
  ): Promise<{ ok: boolean }> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;
    const pattern = context.getPattern();
    this.logger.debug(`received message on ${pattern}`, {
      data,
    });
    try {
      await this.ticketsService.create(data);
      channel.ack(message);
      return { ok: true };
    } catch (e) {
      console.error(e);
      // TODO: requeue when error is timeout or connection error
      channel.nack(message, false, false);
      throw e;
    }
  }
}
