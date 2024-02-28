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
import { MongooseModule } from '@nestjs/mongoose';
import { AmqpClient, AmqpOptions } from '@s1seven/nestjs-tools-amqp-transport';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { getReplyQueueName } from '@ticketing/microservices/shared/rmq';
import { Services } from '@ticketing/shared/constants';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { AppConfigService, EnvironmentVariables } from '../env';
import { MODERATIONS_CLIENT, ORDERS_CLIENT } from '../shared/constants';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketsMSController } from './tickets-ms.controller';

const MongooseFeatures = MongooseModule.forFeatureAsync([
  {
    name: Ticket.name,
    useFactory: () => {
      const schema = TicketSchema;
      schema.plugin(updateIfCurrentPlugin);
      return schema;
    },
    inject: [ConfigService],
  },
]);

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
  };
  return {
    customClass: AmqpClient,
    options,
  };
};

const Clients = ClientsModule.registerAsync([
  {
    name: ORDERS_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: AppConfigService) => {
      const clientOptions = clientFactory(
        configService,
        Services.ORDERS_SERVICE,
      );
      return { ...clientOptions, transport: Transport.RMQ };
    },
  },
  {
    name: MODERATIONS_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: AppConfigService) => {
      const clientOptions = clientFactory(
        configService,
        Services.MODERATION_SERVICE,
      );
      return { ...clientOptions, transport: Transport.RMQ };
    },
  },
]);

@Module({
  imports: [
    MongooseFeatures,
    Clients,
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
  controllers: [TicketsController, TicketsMSController],
  providers: [
    {
      provide: APP_FILTER,
      useExisting: GlobalErrorFilter,
    },
    GlobalErrorFilter,
    TicketsService,
  ],
  exports: [MongooseFeatures, Clients, TicketsService],
})
export class TicketsModule {}
