import { Controller, Inject, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, Transport } from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { NatsStreamingContext } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { Patterns } from '@ticketing/microservices/shared/events';
import { Order } from '@ticketing/shared/models';

import { OrdersService } from './orders.service';

@Controller()
export class OrdersMSController {
  readonly logger = new Logger(OrdersMSController.name);

  constructor(
    @Inject(OrdersService) private readonly ordersService: OrdersService
  ) {}

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.OrderCreated, Transport.NATS)
  async onCreated(
    @Payload() data: Order,
    @Ctx() context: NatsStreamingContext
  ): Promise<void> {
    this.logger.debug(`received message on ${context.message.getSubject()}`, {
      data,
    });
    await this.ordersService.create(data);
    context.message.ack();
  }

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.OrderCancelled, Transport.NATS)
  async onCancelled(
    @Payload() data: Order,
    @Ctx() context: NatsStreamingContext
  ): Promise<void> {
    this.logger.debug(`received message on ${context.message.getSubject()}`, {
      data,
    });
    await this.ordersService.cancel(data);
    context.message.ack();
  }
}
