import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@ticketing/microservices/shared/fastify-passport';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { JwtStrategy } from '@ticketing/microservices/shared/guards';
import { CURRENT_USER_KEY } from '@ticketing/shared/constants';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { Order, OrderSchema } from '../orders/schemas';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment, PaymentSchema } from './schemas';
import { StripeService } from './stripe.service';

const MongooseFeatures = MongooseModule.forFeatureAsync([
  {
    name: Order.name,
    useFactory: () => {
      const schema = OrderSchema;
      schema.plugin(updateIfCurrentPlugin);
      return schema;
    },
  },
  {
    name: Payment.name,
    useFactory: () => {
      const schema = PaymentSchema;
      schema.plugin(updateIfCurrentPlugin);
      return schema;
    },
  },
]);

@Module({
  imports: [
    MongooseFeatures,
    PassportModule.register({
      assignProperty: CURRENT_USER_KEY,
      session: true,
    }),
  ],
  controllers: [PaymentsController],
  providers: [
    {
      provide: APP_FILTER,
      useExisting: GlobalErrorFilter,
    },
    GlobalErrorFilter,
    JwtStrategy,
    StripeService,
    PaymentsService,
  ],
})
export class PaymentsModule {}
