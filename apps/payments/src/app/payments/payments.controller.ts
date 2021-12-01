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
import { JwtAuthGuard } from '@ticketing/microservices/shared/guards';
import { Actions, Resources } from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { User } from '@ticketing/shared/models';

import { CreatePayment, CreatePaymentDto, Payment, PaymentDto } from './models';
import { PaymentsService } from './payments.service';

@Controller(Resources.PAYMENTS)
@ApiTags(Resources.PAYMENTS)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
      whitelist: true,
    })
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
    @CurrentUser() currentUser: User
  ): Promise<Payment> {
    return this.paymentsService.create(payment, currentUser);
  }

  // TODO: for Stripe webhooks look athttps://github.com/fastify/help/issues/158 and https://github.com/golevelup/nestjs/issues/176
}
