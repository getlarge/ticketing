import {
  Controller,
  Inject,
  Logger,
  UseFilters,
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
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { Order } from '@ticketing/shared/models';
import type { Channel } from 'amqp-connection-manager';
import type { Message } from 'amqplib';

import { OrderService } from './orders.service';

const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  exceptionFactory: requestValidationErrorFactory,
  forbidUnknownValues: true,
  whitelist: true,
};

@UseFilters(GlobalErrorFilter)
@Controller()
export class OrdersMSController {
  readonly logger = new Logger(OrdersMSController.name);

  constructor(
    @Inject(OrderService) private readonly orderService: OrderService,
  ) {}

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.OrderCreated, Transport.RMQ)
  async onCreated(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: Order,
    @Ctx() context: RmqContext,
  ): Promise<{
    ok: boolean;
  }> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;
    const pattern = context.getPattern();
    this.logger.debug(`received message on ${pattern}`, {
      data,
    });

    try {
      await this.orderService.createJob(data);
      channel.ack(message);
      return { ok: true };
    } catch (e) {
      channel.nack(message, false, false);
      throw e;
    }
  }

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.OrderCancelled, Transport.RMQ)
  async onCancelled(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: Order,
    @Ctx() context: RmqContext,
  ): Promise<{
    ok: boolean;
  }> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;
    const pattern = context.getPattern();
    this.logger.debug(`received message on ${pattern}`, {
      data,
    });
    try {
      await this.orderService.cancelJob(data);
      channel.ack(message);
      return { ok: true };
    } catch (e) {
      channel.nack(message, false, false);
      throw e;
    }
  }
}
