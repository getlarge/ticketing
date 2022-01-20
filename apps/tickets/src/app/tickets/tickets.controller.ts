import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SecurityRequirements } from '@ticketing/microservices/shared/constants';
import { CurrentUser } from '@ticketing/microservices/shared/decorators';
import { JwtAuthGuard } from '@ticketing/microservices/shared/guards';
import { ParseObjectId } from '@ticketing/microservices/shared/pipes';
import { Actions, Resources } from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { User } from '@ticketing/shared/models';

import {
  CreateTicket,
  CreateTicketDto,
  Ticket,
  TicketDto,
  UpdateTicket,
  UpdateTicketDto,
} from './models';
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
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: true,
    })
  )
  @ApiBearerAuth(SecurityRequirements.Bearer)
  @ApiCookieAuth(SecurityRequirements.Session)
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
  @Post('')
  create(
    @Body() ticket: CreateTicket,
    @CurrentUser() currentUser: User
  ): Promise<Ticket> {
    return this.ticketsService.create(ticket, currentUser);
  }

  @ApiOperation({
    description: 'Request tickets',
    summary: `Find tickets - Scope : ${Resources.TICKETS}:${Actions.READ_MANY}`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tickets found',
    type: TicketDto,
    isArray: true,
  })
  @Get('')
  find(): Promise<Ticket[]> {
    return this.ticketsService.find();
  }

  @ApiOperation({
    description: 'Request a ticket by id',
    summary: `Find a ticket - Scope : ${Resources.TICKETS}:${Actions.READ_ONE}`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket found',
    type: TicketDto,
  })
  @Get(':id')
  findById(@Param('id', ParseObjectId) id: string): Promise<Ticket> {
    return this.ticketsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: true,
    })
  )
  @ApiBearerAuth(SecurityRequirements.Bearer)
  @ApiCookieAuth(SecurityRequirements.Session)
  @ApiOperation({
    description: 'Update a ticket by id',
    summary: `Update a ticket - Scope : ${Resources.TICKETS}:${Actions.UPDATE_ONE}`,
  })
  @ApiBody({ type: UpdateTicketDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket updated',
    type: TicketDto,
  })
  @Put(':id')
  updateById(
    @Param('id', ParseObjectId) id: string,
    @Body() ticket: UpdateTicket,
    @CurrentUser() user: User
  ): Promise<Ticket> {
    return this.ticketsService.updateById(id, ticket, user);
  }
}
