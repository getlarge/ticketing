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
  MessagePattern,
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

import { OrderDto } from './models';
import { OrdersService } from './orders.service';

const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  exceptionFactory: requestValidationErrorFactory,
  forbidUnknownValues: true,
};

@Controller()
export class OrdersMSController {
  readonly logger = new Logger(OrdersMSController.name);

  constructor(
    @Inject(OrdersService) private readonly ordersService: OrdersService,
  ) {}

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.ExpirationCompleted, Transport.RMQ)
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
    try {
      await this.ordersService.expireById(data.id);
      channel.ack(message);
    } catch (e) {
      // TODO: requeue when error is timeout or connection error
      channel.nack(message, false, false);
      throw e;
    }
  }

  @ApiExcludeEndpoint()
  @MessagePattern(Patterns.PaymentCreated, Transport.RMQ)
  async onPaymentCreated(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: Payment,
    @Ctx() context: RmqContext,
  ): Promise<OrderDto> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;
    const pattern = context.getPattern();
    this.logger.debug(`received message on ${pattern}`, {
      data,
    });
    try {
      const order = await this.ordersService.complete(data);
      channel.ack(message);
      return order;
    } catch (e) {
      // TODO: requeue when error is timeout or connection error
      channel.nack(message, false, false);
      throw e;
    }
  }
}
