import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@ticketing/shared/models';
import { Model } from 'mongoose';

import { OrdersService } from './orders.service';
import { OrdersMSController } from './orders-ms.controller';
import { OrderDocument } from './schemas';

describe('OrdersMSController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [
        OrdersMSController,
        {
          provide: OrdersService,
          useValue: new OrdersService(createMock<Model<OrderDocument>>()),
        },
      ],
    }).compile();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('onCreate()', () => {
    it.todo('should replicate the order and ack the message');
  });

  describe('onCcancel()', () => {
    it.todo(
      `should move the order status to ${OrderStatus.Cancelled} and ack the message`,
    );
  });
});
