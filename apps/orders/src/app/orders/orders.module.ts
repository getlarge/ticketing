import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import {
  ClientsModule,
  CustomClientOptions,
  Transport,
} from '@nestjs/microservices';
import { AmqpClient, AmqpOptions } from '@s1seven/nestjs-tools-amqp-transport';
import {
  OryAuthenticationModule,
  OryPermissionsModule,
} from '@ticketing/microservices/ory-client';
import { PassportModule } from '@ticketing/microservices/shared/fastify-passport';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { JwtStrategy } from '@ticketing/microservices/shared/guards';
import { getReplyQueueName } from '@ticketing/microservices/shared/rmq';
import { CURRENT_USER_KEY, Services } from '@ticketing/shared/constants';

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
    replyQueue: getReplyQueueName(consumerService, Services.TICKETS_SERVICE),
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
    PassportModule.register({
      assignProperty: CURRENT_USER_KEY,
      session: true,
    }),
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
    ]),
    ClientsModule.registerAsync([
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
    ]),
    ClientsModule.registerAsync([
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
    OryAuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        kratosAccessToken: configService.get('ORY_KRATOS_API_KEY'),
        kratosPublicApiPath: configService.get('ORY_KRATOS_PUBLIC_URL'),
        kratosAdminApiPath: configService.get('ORY_KRATOS_ADMIN_URL'),

        hydraAccessToken: configService.get('ORY_HYDRA_API_KEY'),
        hydraPublicApiPath: configService.get('ORY_HYDRA_PUBLIC_URL'),
        hydraAdminApiPath: configService.get('ORY_HYDRA_ADMIN_URL'),
      }),
    }),
    OryPermissionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        ketoAccessToken: configService.get('ORY_KETO_API_KEY'),
        ketoPublicApiPath: configService.get('ORY_KETO_PUBLIC_URL'),
        ketoAdminApiPath: configService.get('ORY_KETO_ADMIN_URL'),
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
    JwtStrategy,
  ],
})
export class OrdersModule {}
