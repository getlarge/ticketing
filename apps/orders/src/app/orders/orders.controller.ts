import {
  OryAuthorizationGuard,
  OryPermissionChecks,
} from '@getlarge/keto-client-wrapper';
import { relationTupleBuilder } from '@getlarge/keto-relations-parser';
import { OryAuthenticationGuard } from '@getlarge/kratos-client-wrapper';
import {
  Body,
  CanActivate,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Type,
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
import { PermissionNamespaces } from '@ticketing/microservices/shared/models';
import { ParseObjectId } from '@ticketing/microservices/shared/pipes';
import {
  Actions,
  CURRENT_USER_KEY,
  Resources,
} from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { User } from '@ticketing/shared/models';
import type { FastifyRequest } from 'fastify/types/request';

import { CreateOrder, CreateOrderDto, Order, OrderDto } from './models';
import { OrdersService } from './orders.service';

const AuthenticationGuard = (): Type<CanActivate> =>
  OryAuthenticationGuard({
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
      ctx.switchToHttp().getRequest()[CURRENT_USER_KEY] = {
        id: session.identity.metadata_public['id'],
        email: session.identity.traits.email,
        identityId: session.identity.id,
      };
    },
  });

const AuthorizationGuard = (): Type<CanActivate> => OryAuthorizationGuard({});

@Controller(Resources.ORDERS)
@ApiTags(Resources.ORDERS)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // TODO: check if ticket is reserved via Ory by adding orders to the tickets relations
  @OryPermissionChecks((ctx) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const currentUserId = req[`${CURRENT_USER_KEY}`]['id'];
    const resourceId = (req.body as CreateOrder).ticketId;
    return relationTupleBuilder()
      .subject(PermissionNamespaces[Resources.USERS], currentUserId)
      .isIn('order')
      .of(PermissionNamespaces[Resources.TICKETS], resourceId)
      .toString();
  })
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
      whitelist: true,
    }),
  )
  @ApiBearerAuth(SecurityRequirements.Bearer)
  @ApiCookieAuth(SecurityRequirements.Session)
  @ApiOperation({
    description: 'Request creation of an order',
    summary: `Create an order - Scope : ${Resources.ORDERS}:${Actions.CREATE_ONE}`,
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created',
    type: OrderDto,
  })
  @Post('')
  create(
    @Body() order: CreateOrder,
    @CurrentUser() currentUser: User,
  ): Promise<Order> {
    return this.ordersService.create(order, currentUser);
  }

  @UseGuards(AuthenticationGuard())
  @ApiBearerAuth(SecurityRequirements.Bearer)
  @ApiCookieAuth(SecurityRequirements.Session)
  @ApiOperation({
    description: 'Request user orders',
    summary: `Find orders - Scope : ${Resources.ORDERS}:${Actions.READ_MANY}`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orders found',
    type: OrderDto,
    isArray: true,
  })
  @Get('')
  find(@CurrentUser() currentUser: User): Promise<Order[]> {
    return this.ordersService.find(currentUser);
  }

  @OryPermissionChecks((ctx) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const currentUserId = get(req, `${CURRENT_USER_KEY}.id`);
    const resourceId = get(req.params, 'id');
    return relationTupleBuilder()
      .subject(PermissionNamespaces[Resources.USERS], currentUserId)
      .isIn('owners')
      .of(PermissionNamespaces[Resources.ORDERS], resourceId)
      .toString();
  })
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @ApiBearerAuth(SecurityRequirements.Bearer)
  @ApiCookieAuth(SecurityRequirements.Session)
  @ApiOperation({
    description: 'Request an order by id',
    summary: `Find an order - Scope : ${Resources.ORDERS}:${Actions.READ_ONE}`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order found',
    type: OrderDto,
  })
  @Get(':id')
  findById(@Param('id', ParseObjectId) id: string): Promise<Order> {
    return this.ordersService.findById(id);
  }

  @OryPermissionChecks((ctx) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const currentUserId = get(req, `${CURRENT_USER_KEY}.id`);
    const resourceId = get(req.params, 'id');
    return relationTupleBuilder()
      .subject(PermissionNamespaces[Resources.USERS], currentUserId)
      .isIn('owners')
      .of(PermissionNamespaces[Resources.ORDERS], resourceId)
      .toString();
  })
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
      whitelist: true,
    }),
  )
  @ApiBearerAuth(SecurityRequirements.Bearer)
  @ApiCookieAuth(SecurityRequirements.Session)
  @ApiOperation({
    description: 'Cancel an order by id',
    summary: `Cancel an order - Scope : ${Resources.ORDERS}:${Actions.DELETE_ONE}`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order cancelled',
    type: OrderDto,
  })
  @Delete(':id')
  cancelById(@Param('id', ParseObjectId) id: string): Promise<Order> {
    return this.ordersService.cancelById(id);
  }
}
