import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';

import { MongooseFeatures } from '../shared/mongoose.module';
import { TicketsService } from './tickets.service';
import { TicketsMSController } from './tickets-ms.controller';

@Module({
  imports: [MongooseFeatures],
  controllers: [TicketsMSController],
  providers: [
    TicketsService,
    {
      provide: APP_FILTER,
      useExisting: GlobalErrorFilter,
    },
    GlobalErrorFilter,
  ],
  exports: [MongooseFeatures, TicketsService],
})
export class TicketsModule {}
