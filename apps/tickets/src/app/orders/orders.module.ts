import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { NatsStreamErrorFilter } from '@ticketing/microservices/shared/filters';

import { TicketsModule } from '../tickets/tickets.module';
import { OrdersMSController } from './orders-ms.controller';

@Module({
  imports: [TicketsModule],
  controllers: [OrdersMSController],
  providers: [
    {
      provide: APP_FILTER,
      useExisting: NatsStreamErrorFilter,
    },
    NatsStreamErrorFilter,
  ],
})
export class OrdersModule {}
