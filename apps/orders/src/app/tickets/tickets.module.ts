import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { Order, OrderSchema } from '../orders/schemas';
import { Ticket, TicketSchema } from './schemas';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

const MongooseFeatures = MongooseModule.forFeatureAsync([
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
]);

@Module({
  imports: [MongooseFeatures],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [MongooseFeatures, TicketsService],
})
export class TicketsModule {}
