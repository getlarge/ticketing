import {
  Controller,
  Inject,
  Logger,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { Ctx, EventPattern, Payload, Transport } from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { NatsStreamingContext } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { Patterns } from '@ticketing/microservices/shared/events';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { Order } from '@ticketing/shared/models';

import { OrderService } from './orders.service';

@UseFilters(GlobalErrorFilter)
@Controller()
export class OrdersMSController {
  readonly logger = new Logger(OrdersMSController.name);

  constructor(
    @Inject(OrderService) private readonly orderService: OrderService
  ) {}

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.OrderCreated, Transport.NATS)
  async onCreated(
    @Payload(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: requestValidationErrorFactory,
        forbidUnknownValues: true,
        whitelist: true,
      })
    )
    data: Order,
    @Ctx() context: NatsStreamingContext
  ): Promise<void> {
    this.logger.debug(`received message on ${context.message.getSubject()}`, {
      data,
    });
    await this.orderService.createJob(data);
    context.message.ack();
  }

  @ApiExcludeEndpoint()
  @EventPattern(Patterns.OrderCancelled, Transport.NATS)
  async onCancelled(
    @Payload(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: requestValidationErrorFactory,
        forbidUnknownValues: true,
        whitelist: true,
      })
    )
    data: Order,
    @Ctx() context: NatsStreamingContext
  ): Promise<void> {
    this.logger.debug(`received message on ${context.message.getSubject()}`, {
      data,
    });
    await this.orderService.cancelJob(data);
    context.message.ack();
  }
}
