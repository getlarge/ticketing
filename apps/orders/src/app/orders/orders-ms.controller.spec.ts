/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createNatsContext,
  MockModel,
  MockPublisher,
} from '@ticketing/microservices/shared/testing';
import { Types } from 'mongoose';

import { OrdersService } from './orders.service';
import { OrdersMSController } from './orders-ms.controller';

describe('OrdersMSController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [
        OrdersMSController,
        {
          provide: OrdersService,
          useValue: new OrdersService(
            new MockModel() as any,
            new MockModel() as any,
            new ConfigService({ EXPIRATION_WINDOW_SECONDS: 15 * 60 }),
            new MockPublisher() as any
          ),
        },
      ],
    }).compile();
  });

  describe('onExpiration()', () => {
    it('should call "OrdersService.expireById" and in case of success ack NATS message', async () => {
      // order coming from expiration-service
      const order = { id: new Types.ObjectId().toHexString() };
      const context = createNatsContext();
      const ordersController = app.get(OrdersMSController);
      const ordersService = app.get(OrdersService);
      ordersService.expireById = jest.fn();
      context.message.ack = jest.fn();
      //
      await ordersController.onExpiration(order, context);
      expect(ordersService.expireById).toBeCalledWith(order.id);
      expect(context.message.ack).toBeCalled();
    });

    it('should call "OrdersService.expireById" and in case of error NOT ack NATS message', async () => {
      // order coming from expiration-service
      const order = { id: new Types.ObjectId().toHexString() };
      const context = createNatsContext();
      const expectedError = new Error('Cannot find order');
      const ordersController = app.get(OrdersMSController);
      const ordersService = app.get(OrdersService);
      ordersService.expireById = jest.fn().mockRejectedValueOnce(expectedError);
      context.message.ack = jest.fn();
      //
      await expect(
        ordersController.onExpiration(order, context)
      ).rejects.toThrowError(expectedError);
      expect(ordersService.expireById).toBeCalledWith(order.id);
      expect(context.message.ack).not.toBeCalled();
    });
  });
});
