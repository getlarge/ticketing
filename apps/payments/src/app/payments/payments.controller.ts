import {
  OryAuthorizationGuard,
  OryPermissionChecks,
} from '@getlarge/keto-client-wrapper';
import { relationTupleToString } from '@getlarge/keto-relations-parser';
import { OryAuthenticationGuard } from '@getlarge/kratos-client-wrapper';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
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
import {
  Actions,
  CURRENT_USER_KEY,
  Resources,
} from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { User } from '@ticketing/shared/models';
import type { FastifyRequest } from 'fastify/types/request';
import { get } from 'lodash-es';

import { CreatePayment, CreatePaymentDto, Payment, PaymentDto } from './models';
import { PaymentsService } from './payments.service';

@Controller(Resources.PAYMENTS)
@ApiTags(Resources.PAYMENTS)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @OryPermissionChecks((ctx) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const currentUserId = get(req, `${CURRENT_USER_KEY}.id`);
    const resourceId = get(req.body as CreatePayment, 'orderId');
    return relationTupleToString({
      namespace: PermissionNamespaces[Resources.ORDERS],
      object: resourceId,
      relation: 'owners',
      subjectIdOrSet: {
        namespace: PermissionNamespaces[Resources.USERS],
        object: currentUserId,
      },
    });
  })
  @UseGuards(
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
    }),
    OryAuthorizationGuard({}),
  )
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
    description: 'Attempt to charge for a ticket order',
    summary: `Create payment request - Scope : ${Resources.PAYMENTS}:${Actions.CREATE_ONE}`,
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Charge created',
    type: PaymentDto,
  })
  @Post('')
  create(
    @Body() payment: CreatePayment,
    @CurrentUser() currentUser: User,
  ): Promise<Payment> {
    return this.paymentsService.create(payment, currentUser);
  }

  // TODO: for Stripe webhooks look athttps://github.com/fastify/help/issues/158 and https://github.com/golevelup/nestjs/issues/176
}
