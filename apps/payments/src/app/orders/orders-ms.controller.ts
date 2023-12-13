import { Controller, Inject, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
  Transport,
} from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Patterns } from '@ticketing/microservices/shared/events';
import { Order } from '@ticketing/shared/models';
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
  @EventPattern(Patterns.OrderCreated, Transport.RMQ)
  async onCreated(
    @Payload() data: Order,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;
    const pattern = context.getPattern();
    this.logger.debug(`received message on ${pattern}`, {
      data,
    });
    // TODO: conditional ack
    try {
      await this.ordersService.create(data);
    } finally {
      channel.ack(message);
    }
  }

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.OrderCancelled, Transport.RMQ)
  async onCancelled(
    @Payload() data: Order,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;
    const pattern = context.getPattern();
    this.logger.debug(`received message on ${pattern}`, {
      data,
    });
    // TODO: conditional ack
    try {
      await this.ordersService.cancel(data);
    } finally {
      channel.ack(message);
    }
  }
}
