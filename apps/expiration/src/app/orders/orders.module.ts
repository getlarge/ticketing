import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientsModule,
  CustomClientOptions,
  Transport,
} from '@nestjs/microservices';
import {
  type AmqpOptions,
  AmqpClient,
} from '@s1seven/nestjs-tools-amqp-transport';
import { Services } from '@ticketing/shared/constants';

import { AppConfigService } from '../env';
import { ORDERS_CLIENT, ORDERS_QUEUE } from '../shared/constants';
import { OrdersProcessor } from './orders.processor';
import { OrderService } from './orders.service';
import { OrdersMSController } from './orders-ms.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: ORDERS_QUEUE,
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
            queueOptions: {
              durable: true,
              exclusive: false,
              autoDelete: false,
            },
            replyQueue: `${Services.ORDERS_SERVICE}_REPLY_${Services.EXPIRATION_SERVICE}_QUEUE`,
            replyQueueOptions: {
              durable: true,
              exclusive: true,
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
  ],
  controllers: [OrdersMSController],
  providers: [OrdersProcessor, OrderService],
})
export class OrdersModule {}
