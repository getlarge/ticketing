/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { MockModel } from '@ticketing/microservices/shared/testing';
import { OrderStatus } from '@ticketing/shared/models';

import { OrdersService } from './orders.service';
import { OrdersMSController } from './orders-ms.controller';

describe('OrdersMSController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app = await Test.createTestingModule({
      providers: [
        OrdersMSController,
        {
          provide: OrdersService,
          useValue: new OrdersService(new MockModel() as any),
        },
      ],
    }).compile();
  });

  describe('onCreate()', () => {
    it.todo('should replicate the order and ack the message');
  });

  describe('onCcancel()', () => {
    it.todo(
      `should move the order status to ${OrderStatus.Cancelled} and ack the message`
    );
  });
});
