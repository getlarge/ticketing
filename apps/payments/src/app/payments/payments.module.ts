import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import {
  ClientsModule,
  CustomClientOptions,
  Transport,
} from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { AmqpClient, AmqpOptions } from '@s1seven/nestjs-tools-amqp-transport';
import { OryModule } from '@ticketing/microservices/ory-client';
import { PassportModule } from '@ticketing/microservices/shared/fastify-passport';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { JwtStrategy } from '@ticketing/microservices/shared/guards';
import { getReplyQueueName } from '@ticketing/microservices/shared/rmq';
import { CURRENT_USER_KEY, Services } from '@ticketing/shared/constants';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { AppConfigService } from '../env';
import { Order, OrderSchema } from '../orders/schemas';
import { ORDERS_CLIENT } from '../shared/constants';
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
    ClientsModule.registerAsync([
      {
        name: ORDERS_CLIENT,
        inject: [ConfigService],
        useFactory: (configService: AppConfigService) => {
          const options: AmqpOptions = {
            urls: [configService.get('RMQ_URL') as string],
            persistent: true,
            noAck: true,
            prefetchCount: configService.get('RMQ_PREFETCH_COUNT'),
            isGlobalPrefetchCount: false,
            queue: `${Services.ORDERS_SERVICE}_QUEUE`,
            replyQueue: getReplyQueueName(
              Services.ORDERS_SERVICE,
              Services.PAYMENTS_SERVICE,
            ),
            queueOptions: {
              durable: true,
              exclusive: false,
              autoDelete: false,
            },
            socketOptions: {
              keepAlive: true,
              heartbeatIntervalInSeconds: 30,
              reconnectTimeInSeconds: 1,
            },
          };
          const clientOptions: CustomClientOptions = {
            customClass: AmqpClient,
            options,
          };

          return { ...clientOptions, transport: Transport.RMQ };
        },
      },
    ]),
    OryModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        basePath: configService.get('ORY_BASE_PATH'),
        accessToken: configService.get('ORY_API_KEY'),
      }),
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
