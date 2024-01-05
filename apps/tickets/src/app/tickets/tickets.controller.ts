import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SecurityRequirements } from '@ticketing/microservices/shared/constants';
import {
  ApiNestedQuery,
  ApiPaginatedDto,
  CurrentUser,
  PermissionChecks,
} from '@ticketing/microservices/shared/decorators';
import {
  OryAuthenticationGuard,
  OryPermissionGuard,
} from '@ticketing/microservices/shared/guards';
import {
  PaginatedDto,
  PaginateDto,
  PaginateQuery,
  PermissionNamespaces,
} from '@ticketing/microservices/shared/models';
import {
  ParseObjectId,
  ParseQuery,
} from '@ticketing/microservices/shared/pipes';
import { relationTupleToString } from '@ticketing/microservices/shared/relation-tuple-parser';
import {
  Actions,
  CURRENT_USER_KEY,
  Resources,
} from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { User } from '@ticketing/shared/models';
import { FastifyRequest } from 'fastify/types/request';
import { get } from 'lodash-es';

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
@ApiExtraModels(PaginatedDto)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @UseGuards(OryAuthenticationGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: true,
    }),
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
    @CurrentUser() currentUser: User,
  ): Promise<Ticket> {
    return this.ticketsService.create(ticket, currentUser);
  }

  @UsePipes(
    new ValidationPipe({
      exceptionFactory: requestValidationErrorFactory,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      // forbidUnknownValues: true, //! FIX issue with query parsing process
    }),
  )
  @ApiOperation({
    description: 'Filter tickets',
    summary: `Find tickets - Scope : ${Resources.TICKETS}:${Actions.READ_MANY}`,
  })
  @ApiNestedQuery(PaginateDto)
  @ApiPaginatedDto(TicketDto, 'Tickets found')
  @Get('')
  find(
    @Query(ParseQuery) paginate: PaginateQuery,
  ): Promise<PaginatedDto<Ticket>> {
    return this.ticketsService.find(paginate);
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

  // TODO: check permission for ticket orderId if present
  @PermissionChecks(
    (ctx) => {
      const req = ctx.switchToHttp().getRequest<FastifyRequest>();
      const currentUserId = get(req, `${CURRENT_USER_KEY}.id`);
      const resourceId = get(req, 'params.id');
      return relationTupleToString({
        namespace: PermissionNamespaces[Resources.TICKETS],
        object: resourceId,
        relation: 'owners',
        subjectIdOrSet: {
          namespace: PermissionNamespaces[Resources.USERS],
          object: currentUserId,
        },
      });
    }
  )
  @UseGuards(OryAuthenticationGuard, OryPermissionGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: true,
    }),
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
  @Patch(':id')
  updateById(
    @Param('id', ParseObjectId) id: string,
    @Body() ticket: UpdateTicket,
  ): Promise<Ticket> {
    return this.ticketsService.updateById(id, ticket);
  }
}
