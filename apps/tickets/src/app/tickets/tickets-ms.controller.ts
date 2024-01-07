import {
  Controller,
  Inject,
  Logger,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import {
  Ctx,
  EventPattern,
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

import { TicketsService } from '../tickets/tickets.service';

const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  exceptionFactory: requestValidationErrorFactory,
  forbidUnknownValues: true,
  whitelist: true,
};

@Controller()
export class TicketsMSController {
  readonly logger = new Logger(TicketsMSController.name);

  constructor(
    @Inject(TicketsService) private readonly ticketsService: TicketsService,
  ) {}

  private async updateStatusById(
    data: Ticket,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;
    const pattern = context.getPattern();
    this.logger.debug(`received message on ${pattern}`, {
      data,
    });
    try {
      await this.ticketsService.updateStatusById(data.id, data.status);
      channel.ack(message);
    } catch (e) {
      channel.nack(message);
      throw e;
    }
  }

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.TicketApproved, Transport.RMQ)
  async onApproved(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: Ticket,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.updateStatusById(data, context);
  }

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.TicketRejected, Transport.RMQ)
  async onRejected(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: Ticket,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.updateStatusById(data, context);
  }
}
