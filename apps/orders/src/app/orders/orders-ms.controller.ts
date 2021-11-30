import { Controller, Inject, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, Transport } from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { NatsStreamingContext } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import {
  ExpirationCompletedEvent,
  Patterns,
} from '@ticketing/microservices/shared/events';

import { OrdersService } from './orders.service';

@Controller()
export class OrdersMSController {
  readonly logger = new Logger(OrdersMSController.name);

  constructor(
    @Inject(OrdersService) private readonly ordersService: OrdersService
  ) {}

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.ExpirationCompleted, Transport.NATS)
  async onExpiration(
    @Payload() data: ExpirationCompletedEvent['data'],
    @Ctx() context: NatsStreamingContext
  ): Promise<void> {
    this.logger.verbose(`received message on ${context.message.getSubject()}`, {
      data,
    });
    await this.ordersService.expireById(data.id);
    context.message.ack();
  }
}
