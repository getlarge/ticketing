import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@ticketing/microservices/shared/guards';
import {
  CreateTicketDto,
  TicketDto,
} from '@ticketing/microservices/shared/models';
import { Actions, Resources } from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { CreateTicket, Ticket, User } from '@ticketing/shared/models';

import { CurrentUser } from '../shared/current-user.decorator';
import { TicketsService } from './tickets.service';

@Controller(Resources.TICKETS)
@ApiTags(Resources.TICKETS)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
    })
  )
  @ApiOperation({
    description: 'Request creation of a ticket',
    summary: `Create a ticket - Scope : ${Resources.TICKETS}:${Actions.CREATE_ONE}`,
  })
  @ApiBody({ type: CreateTicketDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Ticket created',
    type: TicketDto,
  })
  @Post('/')
  createTicket(
    @Body() ticket: CreateTicket,
    @CurrentUser() currentUser: User
  ): Promise<Ticket> {
    return this.ticketsService.create(ticket, currentUser);
  }
}
