import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { NatsStreamingTransport } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { PassportModule } from '@ticketing/microservices/shared/fastify-passport';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { JwtStrategy } from '@ticketing/microservices/shared/guards';
import {
  CURRENT_USER_KEY,
  Resources,
  Services,
} from '@ticketing/shared/constants';

import { AppConfigService } from '../env';
import { MongooseFeatures } from '../shared/mongoose.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersMSController } from './orders-ms.controller';

@Module({
  imports: [
    MongooseFeatures,
    PassportModule.register({
      assignProperty: CURRENT_USER_KEY,
      session: true,
    }),
    NatsStreamingTransport.registerAsync({
      useFactory: (configService: AppConfigService) => ({
        clientId: configService.get('NATS_CLIENT_ID'),
        clusterId: configService.get('NATS_CLUSTER_ID'),
        connectOptions: {
          url: configService.get('NATS_URL'),
          name: `${Services.ORDERS_SERVICE}_${Resources.ORDERS}`,
        },
      }),
      inject: [ConfigService],
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
