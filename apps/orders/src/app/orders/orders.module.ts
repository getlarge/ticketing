import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NatsStreamingTransport } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { PassportModule } from '@ticketing/microservices/shared/fastify-passport';
import { JwtStrategy } from '@ticketing/microservices/shared/guards';
import {
  CURRENT_USER_KEY,
  Resources,
  Services,
} from '@ticketing/shared/constants';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { AppConfigService } from '../env';
import { Ticket, TicketSchema } from '../tickets/schemas';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Order.name,
        useFactory: () => {
          const schema = OrderSchema;
          schema.plugin(updateIfCurrentPlugin);
          return schema;
        },
        inject: [ConfigService],
      },
      {
        name: Ticket.name,
        useFactory: () => {
          const schema = TicketSchema;
          schema.plugin(updateIfCurrentPlugin);
          return schema;
        },
        inject: [ConfigService],
      },
    ]),
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
  controllers: [OrdersController],
  providers: [OrdersService, JwtStrategy],
})
export class OrdersModule {}
