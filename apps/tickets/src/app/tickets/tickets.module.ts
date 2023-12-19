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
import {
  OryAuthenticationModule,
  OryPermissionsModule,
} from '@ticketing/microservices/ory-client';
import { PassportModule } from '@ticketing/microservices/shared/fastify-passport';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { JwtStrategy } from '@ticketing/microservices/shared/guards';
import { getReplyQueueName } from '@ticketing/microservices/shared/rmq';
import { CURRENT_USER_KEY, Services } from '@ticketing/shared/constants';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { AppConfigService, EnvironmentVariables } from '../env';
import { ORDERS_CLIENT } from '../shared/constants';
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
    PassportModule.register({
      assignProperty: CURRENT_USER_KEY,
      session: true,
    }),
    OrdersClient,
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
  controllers: [TicketsController],
  providers: [
    {
      provide: APP_FILTER,
      useExisting: GlobalErrorFilter,
    },
    GlobalErrorFilter,
    TicketsService,
    JwtStrategy,
  ],
  exports: [MongooseFeatures, OrdersClient, TicketsService],
})
export class TicketsModule {}
