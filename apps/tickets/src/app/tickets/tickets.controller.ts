import {
  OryAuthorizationGuard,
  OryPermissionChecks,
} from '@getlarge/keto-client-wrapper';
import { relationTupleBuilder } from '@getlarge/keto-relations-parser';
import { OryAuthenticationGuard } from '@getlarge/kratos-client-wrapper';
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
  ValidationPipeOptions,
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
} from '@ticketing/microservices/shared/decorators';
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
import {
  Actions,
  CURRENT_USER_KEY,
  Resources,
} from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { User } from '@ticketing/shared/models';
import type { FastifyRequest } from 'fastify/types/request';

import {
  CreateTicket,
  CreateTicketDto,
  Ticket,
  TicketDto,
  UpdateTicket,
  UpdateTicketDto,
} from './models';
import { TicketsService } from './tickets.service';

const AuthenticationGuard = OryAuthenticationGuard({
  cookieResolver: (ctx) =>
    ctx.switchToHttp().getRequest<FastifyRequest>().headers.cookie,
  isValidSession: (x) => {
    return (
      !!x?.identity &&
      typeof x.identity.traits === 'object' &&
      !!x.identity.traits &&
      'email' in x.identity.traits &&
      typeof x.identity.metadata_public === 'object' &&
      !!x.identity.metadata_public &&
      'id' in x.identity.metadata_public &&
      typeof x.identity.metadata_public.id === 'string'
    );
  },
  sessionTokenResolver: (ctx) =>
    ctx
      .switchToHttp()
      .getRequest<FastifyRequest>()
      .headers?.authorization?.replace('Bearer ', ''),
  postValidationHook: (ctx, session) => {
    ctx.switchToHttp().getRequest().session = session;
    // eslint-disable-next-line security/detect-object-injection
    ctx.switchToHttp().getRequest()[CURRENT_USER_KEY] = {
      id: session.identity.metadata_public['id'],
      email: session.identity.traits.email,
      identityId: session.identity.id,
    };
  },
});

const AuthorizationGuard = OryAuthorizationGuard({});

const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  exceptionFactory: requestValidationErrorFactory,
  transformOptions: { enableImplicitConversion: true },
  forbidUnknownValues: true,
};

@Controller(Resources.TICKETS)
@ApiTags(Resources.TICKETS)
@ApiExtraModels(PaginatedDto)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(AuthenticationGuard)
  @UsePipes(new ValidationPipe(validationPipeOptions))
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
  @OryPermissionChecks((ctx) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const currentUserId = req[`${CURRENT_USER_KEY}`]['id'];
    const resourceId = (req.params as { id: string }).id;
    return relationTupleBuilder()
      .subject(PermissionNamespaces[Resources.USERS], currentUserId)
      .isIn('owners')
      .of(PermissionNamespaces[Resources.TICKETS], resourceId)
      .toString();
  })
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @UsePipes(new ValidationPipe(validationPipeOptions))
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
