import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsStreamingTransport } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { Resources, Services } from '@ticketing/shared/constants';

import { AppConfigService } from '../env';
import { ORDERS_QUEUE } from '../shared/constants';
import { OrdersProcessor } from './orders.processor';
import { OrderService } from './orders.service';
import { OrdersMSController } from './orders-ms.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: ORDERS_QUEUE,
    }),
    NatsStreamingTransport.registerAsync({
      useFactory: (configService: AppConfigService) => ({
        clientId: configService.get('NATS_CLIENT_ID'),
        clusterId: configService.get('NATS_CLUSTER_ID'),
        connectOptions: {
          url: configService.get('NATS_URL'),
          name: `${Services.EXPIRATION_SERVICE}_${Resources.EXPIRATION}`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [OrdersMSController],
  providers: [OrdersProcessor, OrderService],
})
export class OrdersModule {}
