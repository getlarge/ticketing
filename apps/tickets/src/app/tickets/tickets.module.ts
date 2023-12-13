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
import { CURRENT_USER_KEY, Services } from '@ticketing/shared/constants';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { AppConfigService } from '../env';
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
        replyQueue: `${Services.ORDERS_SERVICE}_REPLY_${Services.TICKETS_SERVICE}_QUEUE`,
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
    OryModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        basePath: configService.get('ORY_BASE_PATH'),
        accessToken: configService.get('ORY_API_KEY'),
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
