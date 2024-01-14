import {
  OryPermissionsModule,
  OryRelationshipsModule,
} from '@getlarge/keto-client-wrapper';
import { OryFrontendModule } from '@getlarge/kratos-client-wrapper';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import {
  ClientsModule,
  CustomClientOptions,
  Transport,
} from '@nestjs/microservices';
import { AmqpClient, AmqpOptions } from '@s1seven/nestjs-tools-amqp-transport';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { getReplyQueueName } from '@ticketing/microservices/shared/rmq';
import { Services } from '@ticketing/shared/constants';

import { AppConfigService, EnvironmentVariables } from '../env';
import {
  EXPIRATION_CLIENT,
  PAYMENTS_CLIENT,
  TICKETS_CLIENT,
} from '../shared/constants';
import { MongooseFeatures } from '../shared/mongoose.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersMSController } from './orders-ms.controller';

const clientFactory = (
  configService: AppConfigService,
  consumerService: Services,
): CustomClientOptions => {
  const options: AmqpOptions = {
    urls: [configService.get('RMQ_URL') as string],
    persistent: true,
    noAck: true,
    prefetchCount: configService.get('RMQ_PREFETCH_COUNT'),
    isGlobalPrefetchCount: false,
    queue: `${consumerService}_QUEUE`,
    replyQueue: getReplyQueueName(consumerService, Services.ORDERS_SERVICE),
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
    // ? maybe it would be more efficient to use a broadcast exchange since all services are interested in the orders events
    // replyQueue: null,
    // noReplyQueueAssert: true,
    // exchange: `${Services.EXPIRATION_SERVICE}_BROADCAST`,
    // exchangeType: 'topic',
    // exchangeOptions: { durable: true },
  };
  return {
    customClass: AmqpClient,
    options,
  };
};

@Module({
  imports: [
    MongooseFeatures,
    ClientsModule.registerAsync([
      {
        name: TICKETS_CLIENT,
        inject: [ConfigService],
        useFactory: (configService: AppConfigService) => {
          return {
            ...clientFactory(configService, Services.TICKETS_SERVICE),
            transport: Transport.RMQ,
          };
        },
      },
      {
        name: EXPIRATION_CLIENT,
        inject: [ConfigService],
        useFactory: (configService: AppConfigService) => {
          return {
            ...clientFactory(configService, Services.EXPIRATION_SERVICE),
            transport: Transport.RMQ,
          };
        },
      },
      {
        name: PAYMENTS_CLIENT,
        inject: [ConfigService],
        useFactory: (configService: AppConfigService) => {
          return {
            ...clientFactory(configService, Services.PAYMENTS_SERVICE),
            transport: Transport.RMQ,
          };
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
  controllers: [OrdersController, OrdersMSController],
  providers: [
    {
      provide: APP_FILTER,
      useExisting: GlobalErrorFilter,
    },
    GlobalErrorFilter,
    OrdersService,
  ],
})
export class OrdersModule {}
