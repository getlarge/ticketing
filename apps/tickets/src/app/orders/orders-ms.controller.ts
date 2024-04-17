import {
  Controller,
  Inject,
  Logger,
  UseFilters,
  UseInterceptors,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
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

import { TicketDto } from '../tickets/models';
import { TicketsService } from '../tickets/tickets.service';

const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  exceptionFactory: requestValidationErrorFactory,
  forbidUnknownValues: true,
  whitelist: true,
};
@UseInterceptors(MessageAckInterceptor)
@UseFilters(GlobalErrorFilter)
@Controller()
export class OrdersMSController {
  readonly logger = new Logger(OrdersMSController.name);

  constructor(
    @Inject(TicketsService) private readonly ticketsService: TicketsService,
  ) {}

  @ApiExcludeEndpoint()
  @MessagePattern(OrderCreatedEvent.name, Transport.RMQ)
  onCreated(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: OrderCreatedEventData,
  ): Promise<TicketDto> {
    return this.ticketsService.createOrder(data);
  }

  @ApiExcludeEndpoint()
  @MessagePattern(OrderCancelledEvent.name, Transport.RMQ)
  onCancelled(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: OrderCancelledEventData,
  ): Promise<TicketDto> {
    return this.ticketsService.cancelOrder(data);
  }
}
