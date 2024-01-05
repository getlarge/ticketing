import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientsModule,
  CustomClientOptions,
  Transport,
} from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { AmqpClient, AmqpOptions } from '@s1seven/nestjs-tools-amqp-transport';
import { getReplyQueueName } from '@ticketing/microservices/shared/rmq';
import { Services } from '@ticketing/shared/constants';

import { AppConfigService } from '../env';
import { ModerationSchema } from '../moderation/schemas';
import { TicketSchema } from './schemas';
import { TicketsService } from './tickets.service';
import { TicketsMSController } from './tickets-ms.controller';

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
    replyQueue: getReplyQueueName(consumerService, Services.MODERATION_SERVICE),
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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Moderation', schema: ModerationSchema },
      { name: 'Ticket', schema: TicketSchema },
    ]),
    // this client is used to send ticket moderation events to the tickets micro-service
    ClientsModule.registerAsync([
      {
        name: 'TICKETS_CLIENT',
        inject: [ConfigService],
        useFactory: (configService: AppConfigService) => {
          return {
            ...clientFactory(configService, Services.TICKETS_SERVICE),
            transport: Transport.RMQ,
          };
        },
      },
    ]),
    // this client is used to send ticket moderation events to the orders micro-service
    ClientsModule.registerAsync([
      {
        name: 'ORDERS_CLIENT',
        inject: [ConfigService],
        useFactory: (configService: AppConfigService) => {
          return {
            ...clientFactory(configService, Services.ORDERS_SERVICE),
            transport: Transport.RMQ,
          };
        },
      },
    ]),
  ],
  controllers: [TicketsMSController],
  providers: [TicketsService],
  exports: [],
})
export class TicketsModule {}
