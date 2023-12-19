/* eslint-disable max-nested-callbacks */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createRmqContext,
  MockModel,
  MockOryPermissionService,
  MockPublisher,
} from '@ticketing/microservices/shared/testing';
import { Channel } from 'amqp-connection-manager';
import { Types } from 'mongoose';

import { Order } from './models';
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
            new MockOryPermissionService() as any,
            new MockPublisher() as any,
            new MockPublisher() as any,
            new MockPublisher() as any,
          ),
        },
      ],
    }).compile();
  });

  describe('onExpiration()', () => {
    it('should call "OrdersService.expireById" and in case of success ack RMQ message', async () => {
      // order coming from expiration-service
      const order = { id: new Types.ObjectId().toHexString() } as Order;
      const context = createRmqContext();
      const ordersController = app.get(OrdersMSController);
      const ordersService = app.get(OrdersService);
      ordersService.expireById = jest.fn(() => Promise.resolve(order));
      context.getChannelRef().ack = jest.fn();
      //
      await ordersController.onExpiration(order, context);
      expect(ordersService.expireById).toBeCalledWith(order.id);
      expect(context.getChannelRef().ack).toBeCalled();
    });

    it('should call "OrdersService.expireById" and in case of error NOT ack RMQ message', async () => {
      // order coming from expiration-service
      const order = { id: new Types.ObjectId().toHexString() };
      const context = createRmqContext();
      const expectedError = new Error('Cannot find order');
      const ordersController = app.get(OrdersMSController);
      const ordersService = app.get(OrdersService);
      ordersService.expireById = jest
        .fn(() => {
          throw expectedError;
        })
        .mockRejectedValueOnce(expectedError);
      context.getChannelRef().ack = jest.fn();
      const channel = context.getChannelRef() as Channel;
      channel.ack = jest.fn();
      channel.nack = jest.fn();
      //
      await expect(
        ordersController.onExpiration(order, context),
      ).rejects.toThrowError(expectedError);
      expect(ordersService.expireById).toBeCalledWith(order.id);
      expect(channel.ack).not.toBeCalled();
      expect(channel.nack).toBeCalled();
    });
  });
});
