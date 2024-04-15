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
  ExpirationCompletedEventData,
  PaymentCreatedEvent,
  PaymentCreatedEventData,
} from '@ticketing/microservices/shared/events';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
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
  @EventPattern(ExpirationCompletedEvent.name, Transport.RMQ)
  async onExpiration(
    @Payload() data: ExpirationCompletedEventData,
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
  @MessagePattern(PaymentCreatedEvent.name, Transport.RMQ)
  async onPaymentCreated(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: PaymentCreatedEventData,
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
