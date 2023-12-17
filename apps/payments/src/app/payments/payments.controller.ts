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
import {
  CurrentUser,
  PermissionCheck,
} from '@ticketing/microservices/shared/decorators';
import {
  OryAuthGuard,
  OryPermissionGuard,
} from '@ticketing/microservices/shared/guards';
import { PermissionNamespaces } from '@ticketing/microservices/shared/models';
import { relationTupleToString } from '@ticketing/microservices/shared/relation-tuple-parser';
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

  @PermissionCheck((ctx) => {
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
  @UseGuards(OryAuthGuard, OryPermissionGuard)
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
