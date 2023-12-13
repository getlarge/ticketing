import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import {
  ClientsModule,
  CustomClientOptions,
  Transport,
} from '@nestjs/microservices';
import { AmqpClient, AmqpOptions } from '@s1seven/nestjs-tools-amqp-transport';
import { OryModule } from '@ticketing/microservices/ory-client';
import { PassportModule } from '@ticketing/microservices/shared/fastify-passport';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { JwtStrategy } from '@ticketing/microservices/shared/guards';
import { getReplyQueueName } from '@ticketing/microservices/shared/rmq';
import { CURRENT_USER_KEY, Services } from '@ticketing/shared/constants';

import { AppConfigService } from '../env';
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
    OryModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        basePath: configService.get('ORY_BASE_PATH'),
        accessToken: configService.get('ORY_API_KEY'),
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
