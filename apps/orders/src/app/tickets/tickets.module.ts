import { Module } from '@nestjs/common';

import { MongooseFeatures } from '../shared/mongoose.module';
import { TicketsService } from './tickets.service';
import { TicketsMSController } from './tickets-ms.controller';

@Module({
  imports: [MongooseFeatures],
  controllers: [TicketsMSController],
  providers: [TicketsService],
  exports: [MongooseFeatures, TicketsService],
})
export class TicketsModule {}
