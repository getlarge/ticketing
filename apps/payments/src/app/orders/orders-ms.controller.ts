import { Controller, Inject, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  Transport,
} from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
} from '@ticketing/microservices/shared/events';
import type { Channel } from 'amqp-connection-manager';
import type { Message } from 'amqplib';

import { OrdersService } from './orders.service';

@Controller()
export class OrdersMSController {
  readonly logger = new Logger(OrdersMSController.name);

  constructor(
    @Inject(OrdersService) private readonly ordersService: OrdersService,
  ) {}

  @ApiExcludeEndpoint()
  @MessagePattern(OrderCreatedEvent.name, Transport.RMQ)
  async onCreated(
    @Payload() data: OrderCreatedEvent['data'],
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
      await this.ordersService.create(data);
      channel.ack(message);
      return { ok: true };
    } catch (e) {
      channel.nack(message, false, false);
      throw e;
    }
  }

  @ApiExcludeEndpoint()
  @MessagePattern(OrderCancelledEvent.name, Transport.RMQ)
  async onCancelled(
    @Payload() data: OrderCancelledEvent['data'],
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
      await this.ordersService.cancel(data);
      channel.ack(message);
      return { ok: true };
    } catch (e) {
      channel.nack(message, false, false);
      throw e;
    }
  }
}
