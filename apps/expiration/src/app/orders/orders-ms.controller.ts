import {
  Controller,
  Inject,
  Logger,
  UseFilters,
  UseInterceptors,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { EventPattern, Payload, Transport } from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  OrderCancelledEvent,
  OrderCancelledEventData,
  OrderCreatedEvent,
  OrderCreatedEventData,
} from '@ticketing/microservices/shared/events';
import {
  GlobalErrorFilter,
  MessageAckInterceptor,
} from '@ticketing/microservices/shared/filters';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';

import { OrderService } from './orders.service';

const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  exceptionFactory: requestValidationErrorFactory,
  forbidUnknownValues: true,
  whitelist: true,
};

@UseFilters(GlobalErrorFilter)
@UseInterceptors(MessageAckInterceptor)
@Controller()
export class OrdersMSController {
  readonly logger = new Logger(OrdersMSController.name);

  constructor(
    @Inject(OrderService) private readonly orderService: OrderService,
  ) {}

  @ApiExcludeEndpoint()
  @EventPattern(OrderCreatedEvent.name, Transport.RMQ)
  async onCreated(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: OrderCreatedEventData,
  ): Promise<{
    ok: boolean;
  }> {
    await this.orderService.createJob(data);
    return { ok: true };
  }

  @ApiExcludeEndpoint()
  @EventPattern(OrderCancelledEvent.name, Transport.RMQ)
  async onCancelled(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: OrderCancelledEventData,
  ): Promise<{
    ok: boolean;
  }> {
    await this.orderService.cancelJob(data);
    return { ok: true };
  }
}
