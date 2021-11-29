import { Module } from '@nestjs/common';

import { TicketsModule } from '../tickets/tickets.module';
import { OrdersMSController } from './orders-ms.controller';

@Module({
  imports: [TicketsModule],
  controllers: [OrdersMSController],
  providers: [],
})
export class OrdersModule {}
