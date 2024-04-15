import {
  Controller,
  Inject,
  Logger,
  UseFilters,
  UseInterceptors,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import {
  EventPattern,
  MessagePattern,
  Payload,
  Transport,
} from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  ExpirationCompletedEvent,
  ExpirationCompletedEventData,
  PaymentCreatedEvent,
  PaymentCreatedEventData,
} from '@ticketing/microservices/shared/events';
import {
  GlobalErrorFilter,
  MessageAckInterceptor,
} from '@ticketing/microservices/shared/filters';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';

import { OrderDto } from './models';
import { OrdersService } from './orders.service';

const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  exceptionFactory: requestValidationErrorFactory,
  forbidUnknownValues: true,
};

@UseInterceptors(MessageAckInterceptor)
@UseFilters(GlobalErrorFilter)
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
  ): Promise<void> {
    await this.ordersService.expireById(data.id);
  }

  @ApiExcludeEndpoint()
  @MessagePattern(PaymentCreatedEvent.name, Transport.RMQ)
  onPaymentCreated(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: PaymentCreatedEventData,
  ): Promise<OrderDto> {
    return this.ordersService.complete(data);
  }
}
