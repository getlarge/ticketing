/* eslint-disable max-nested-callbacks */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { OryPermissionsService } from '@getlarge/keto-client-wrapper';
import { createMock } from '@golevelup/ts-jest';
import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createRmqContext,
  MockOryPermissionsService,
  MockOryRelationshipsService,
} from '@ticketing/microservices/shared/testing';
import { Channel } from 'amqp-connection-manager';
import { Model, Types } from 'mongoose';

import { TicketDocument } from '../tickets/schemas';
import { Order } from './models';
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
          useValue: new OrdersService(
            createMock<Model<OrderDocument>>(),
            createMock<Model<TicketDocument>>(),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            new ConfigService({ EXPIRATION_WINDOW_SECONDS: 15 * 60 }),
            new MockOryRelationshipsService() as any,
            createMock<ClientProxy>(),
            createMock<ClientProxy>(),
            createMock<ClientProxy>(),
          ),
        },
        {
          provide: OryPermissionsService,
          useValue: new MockOryPermissionsService() as any,
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
