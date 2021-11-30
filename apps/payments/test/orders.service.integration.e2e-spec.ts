/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigModule } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { loadEnv } from '@ticketing/microservices/shared/env';
import { Model } from 'mongoose';

import { OrdersModule } from '../src/app/orders/orders.module';
import { OrdersService } from '../src/app/orders/orders.service';
import { Order as OrderSchema, OrderDocument } from '../src/app/orders/schemas';
import { envFilePath } from './constants';

describe('OrdersService', () => {
  let app: TestingModule;
  let ordersService: OrdersService;
  let orderModel: Model<OrderDocument>;
  const envVariables = loadEnv(envFilePath, true);

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          expandVariables: true,
          envFilePath,
          load: [() => envVariables],
        }),
        OrdersModule,
        MongooseModule.forRoot(envVariables['MONGODB_URI']),
      ],
    }).compile();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ordersService = app.get(OrdersService);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    orderModel = app.get<Model<OrderDocument>>(getModelToken(OrderSchema.name));
  });

  describe('create()', () => {
    it.todo(`should replicate the incoming order`);
  });

  describe('cancel()', () => {
    it.todo(`should throw not found exception if the order is not in the DB`);
    it.todo(`should update order status`);
  });
});
