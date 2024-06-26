import { OryOAuth2Module } from '@getlarge/hydra-client-wrapper';
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
import {
  OryAuthenticationGuard,
  OryOAuth2AuthenticationGuard,
} from '@ticketing/microservices/shared/guards';
import { getReplyQueueName } from '@ticketing/microservices/shared/rmq';
import { Services } from '@ticketing/shared/constants';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { AppConfigService, EnvironmentVariables } from '../env';
import {
  ORDERS_CLIENT,
  ORY_AUTH_GUARD,
  ORY_OAUTH2_GUARD,
} from '../shared/constants';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

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

const OrdersClient = ClientsModule.registerAsync([
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
          Services.TICKETS_SERVICE,
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
]);

@Module({
  imports: [
    MongooseFeatures,
    OrdersClient,
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
    OryOAuth2Module.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        basePath: configService.get('ORY_HYDRA_PUBLIC_URL'),
        accessToken: configService.get('ORY_HYDRA_API_KEY'),
      }),
    }),
  ],
  controllers: [TicketsController],
  providers: [
    {
      provide: APP_FILTER,
      useExisting: GlobalErrorFilter,
    },
    GlobalErrorFilter,
    TicketsService,
    {
      provide: ORY_AUTH_GUARD,
      useClass: OryAuthenticationGuard(),
    },
    {
      provide: ORY_OAUTH2_GUARD,
      useClass: OryOAuth2AuthenticationGuard(),
    },
  ],
  exports: [MongooseFeatures, OrdersClient, TicketsService],
})
export class TicketsModule {}
