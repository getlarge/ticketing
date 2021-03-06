import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { NatsStreamingTransport } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { PassportModule } from '@ticketing/microservices/shared/fastify-passport';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { JwtStrategy } from '@ticketing/microservices/shared/guards';
import {
  CURRENT_USER_KEY,
  Resources,
  Services,
} from '@ticketing/shared/constants';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { AppConfigService } from '../env';
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

const NatsPublisher = NatsStreamingTransport.registerAsync({
  useFactory: (configService: AppConfigService) => ({
    clientId: configService.get('NATS_CLIENT_ID'),
    clusterId: configService.get('NATS_CLUSTER_ID'),
    connectOptions: {
      url: configService.get('NATS_URL'),
      name: `${Services.TICKETS_SERVICE}_${Resources.TICKETS}`,
    },
  }),
  inject: [ConfigService],
});

@Module({
  imports: [
    MongooseFeatures,
    PassportModule.register({
      assignProperty: CURRENT_USER_KEY,
      session: true,
    }),
    NatsPublisher,
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
  exports: [MongooseFeatures, NatsPublisher, TicketsService],
})
export class TicketsModule {}
