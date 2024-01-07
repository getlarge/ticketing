import {
  Controller,
  Inject,
  Logger,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  Transport,
} from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { EventsMap, Patterns } from '@ticketing/microservices/shared/events';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import type { Channel } from 'amqp-connection-manager';
import type { Message } from 'amqplib';

import { TicketDto } from './models';
import { TicketsService } from './tickets.service';

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

  @ApiExcludeEndpoint()
  @MessagePattern(Patterns.TicketApproved, Transport.RMQ)
  async onCreated(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: EventsMap[Patterns.TicketApproved],
    @Ctx() context: RmqContext,
  ): Promise<TicketDto> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;
    const pattern = context.getPattern();
    this.logger.debug(`received message on ${pattern}`, {
      data,
    });
    try {
      const ticket = await this.ticketsService.create(data);
      channel.ack(message);
      return ticket;
    } catch (e) {
      // TODO: requeue when error is timeout or connection error
      channel.nack(message, false, false);
      throw e;
    }
  }

  @ApiExcludeEndpoint()
  @MessagePattern(Patterns.TicketUpdated, Transport.RMQ)
  async onUpdated(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: EventsMap[Patterns.TicketUpdated],
    @Ctx() context: RmqContext,
  ): Promise<TicketDto> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;
    const pattern = context.getPattern();
    this.logger.debug(`received message on ${pattern}`, {
      data,
    });
    try {
      const ticket = await this.ticketsService.updateById(data.id, data);
      channel.ack(message);
      return ticket;
    } catch (e) {
      // TODO: requeue when error is timeout or connection error
      channel.nack(message, false, false);
      throw e;
    }
  }
}
