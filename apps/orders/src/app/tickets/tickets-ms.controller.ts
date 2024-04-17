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
  TicketApprovedEvent,
  TicketApprovedEventData,
  TicketEventData,
  TicketUpdatedEvent,
} from '@ticketing/microservices/shared/events';
import {
  GlobalErrorFilter,
  MessageAckInterceptor,
} from '@ticketing/microservices/shared/filters';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';

import { TicketDto } from './models';
import { TicketsService } from './tickets.service';

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
export class TicketsMSController {
  readonly logger = new Logger(TicketsMSController.name);

  constructor(
    @Inject(TicketsService) private readonly ticketsService: TicketsService,
  ) {}

  @ApiExcludeEndpoint()
  @MessagePattern(TicketApprovedEvent.name, Transport.RMQ)
  onCreated(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: TicketApprovedEventData,
  ): Promise<TicketDto> {
    return this.ticketsService.create(data);
  }

  @ApiExcludeEndpoint()
  @MessagePattern(TicketUpdatedEvent.name, Transport.RMQ)
  onUpdated(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: TicketEventData,
  ): Promise<TicketDto> {
    return this.ticketsService.updateById(data.id, data);
  }
}
