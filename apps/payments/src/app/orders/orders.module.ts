import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';

import { MongooseFeatures } from '../shared/mongoose.module';
import { OrdersService } from './orders.service';
import { OrdersMSController } from './orders-ms.controller';

@Module({
  imports: [MongooseFeatures],
  controllers: [OrdersMSController],
  providers: [
    {
      provide: APP_FILTER,
      useExisting: GlobalErrorFilter,
    },
    GlobalErrorFilter,
    OrdersService,
  ],
})
export class OrdersModule {}
