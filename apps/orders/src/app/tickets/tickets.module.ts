import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Order, OrderSchema } from '../orders/schemas';
import { Ticket, TicketSchema } from './schemas';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

const MongooseFeatures = MongooseModule.forFeature([
  {
    name: Ticket.name,
    schema: TicketSchema,
  },
  {
    name: Order.name,
    schema: OrderSchema,
  },
]);

@Module({
  imports: [MongooseFeatures],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [MongooseFeatures, TicketsService],
})
export class TicketsModule {}
