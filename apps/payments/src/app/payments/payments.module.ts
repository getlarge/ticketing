import {
  OryPermissionsModule,
  OryRelationshipsModule,
} from '@getlarge/keto-client-wrapper';
import { OryFrontendModule } from '@getlarge/kratos-client-wrapper';
import { AmqpClient, AmqpOptions } from '@getlarge/nestjs-tools-amqp-transport';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import {
  ClientsModule,
  CustomClientOptions,
  Transport,
} from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { getReplyQueueName } from '@ticketing/microservices/shared/rmq';
import { Services } from '@ticketing/shared/constants';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { AppConfigService, EnvironmentVariables } from '../env';
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
    OryFrontendModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        basePath: configService.get('ORY_KRATOS_PUBLIC_URL'),
      }),
    }),
    OryPermissionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        basePath: configService.get('ORY_KETO_PUBLIC_URL'),
      }),
    }),
    OryRelationshipsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        accessToken: configService.get('ORY_KETO_API_KEY'),
        basePath: configService.get('ORY_KETO_ADMIN_URL'),
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
    StripeService,
    PaymentsService,
  ],
})
export class PaymentsModule {}
