import { Controller, Inject, Logger, ValidationPipe } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
  Transport,
} from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  ExpirationCompletedEvent,
  Patterns,
} from '@ticketing/microservices/shared/events';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { Payment } from '@ticketing/shared/models';
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
  @EventPattern(Patterns.ExpirationCompleted, Transport.NATS)
  async onExpiration(
    @Payload() data: ExpirationCompletedEvent['data'],
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
      await this.ordersService.expireById(data.id);
    } finally {
      channel.ack(message);
    }
  }

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.PaymentCreated, Transport.NATS)
  async onPaymentCreated(
    @Payload(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: requestValidationErrorFactory,
        forbidUnknownValues: true,
      }),
    )
    data: Payment,
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
      await this.ordersService.complete(data);
    } finally {
      channel.ack(message);
    }
  }
}
