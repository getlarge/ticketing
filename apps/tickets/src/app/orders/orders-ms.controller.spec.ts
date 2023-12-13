/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import {
  createRmqContext,
  MockModel,
  MockPublisher,
} from '@ticketing/microservices/shared/testing';
import { Channel } from 'amqp-connection-manager';

import { mockOrderEvent } from '../../../test/models/order.mock';
import { TicketsService } from '../tickets/tickets.service';
import { OrdersMSController } from './orders-ms.controller';

describe('OrdersMSController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [
        OrdersMSController,
        {
          provide: TicketsService,
          useValue: new TicketsService(
            new MockModel() as any,
            new MockPublisher() as any,
          ),
        },
      ],
    }).compile();
  });

  describe('onCreated()', () => {
    it('should call "TicketsService.createOrder" and in case of success ack RMQ message', async () => {
      // ticket coming from tickets-service
      const order = mockOrderEvent();
      const context = createRmqContext();
      const ordersMSController = app.get(OrdersMSController);
      const ticketsService = app.get(TicketsService);
      ticketsService.createOrder = jest.fn();
      context.getChannelRef().ack = jest.fn();
      //
      await ordersMSController.onCreated(order, context);
      expect(ticketsService.createOrder).toBeCalledWith(order);
      expect(context.getChannelRef().ack).toBeCalled();
    });

    it('should call "TicketsService.createOrder" and in case of error NOT ack RMQ message', async () => {
      // ticket coming from tickets-service
      const order = mockOrderEvent();
      const context = createRmqContext();
      const expectedError = new Error('Cannot create ticket');
      const ordersMSController = app.get(OrdersMSController);
      const ticketsService = app.get(TicketsService);
      ticketsService.createOrder = jest
        .fn()
        .mockRejectedValueOnce(expectedError);
      const channel = context.getChannelRef() as Channel;
      channel.ack = jest.fn();
      channel.nack = jest.fn();
      //
      await expect(
        ordersMSController.onCreated(order, context),
      ).rejects.toThrowError(expectedError);
      expect(ticketsService.createOrder).toBeCalledWith(order);
      expect(channel.ack).not.toBeCalled();
      expect(channel.nack).toBeCalled();
    });
  });

  describe('onCancelled()', () => {
    it('should call "TicketsService.cancelOrder" and in case of success, ack RMQ message', async () => {
      // ticket coming from tickets-service
      const order = mockOrderEvent();
      const context = createRmqContext();
      const ordersMSController = app.get(OrdersMSController);
      const ticketsService = app.get(TicketsService);
      ticketsService.cancelOrder = jest.fn();
      context.getChannelRef().ack = jest.fn();
      //
      await ordersMSController.onCancelled(order, context);
      expect(ticketsService.cancelOrder).toBeCalledWith(order);
      expect(context.getChannelRef().ack).toBeCalled();
    });

    it('should call "TicketsService.cancelOrder" and in case of error, NOT ack RMQ message', async () => {
      // ticket coming from tickets-service
      const order = mockOrderEvent();
      const context = createRmqContext();
      const expectedError = new Error('Cannot create ticket');
      const ordersMSController = app.get(OrdersMSController);
      const ticketsService = app.get(TicketsService);
      ticketsService.cancelOrder = jest
        .fn()
        .mockRejectedValueOnce(expectedError);
      const channel = context.getChannelRef() as Channel;
      channel.ack = jest.fn();
      channel.nack = jest.fn();
      //
      await expect(
        ordersMSController.onCancelled(order, context),
      ).rejects.toThrowError(expectedError);
      expect(ticketsService.cancelOrder).toBeCalledWith(order);
      expect(channel.ack).not.toBeCalled();
      expect(channel.nack).toBeCalled();
    });
  });
});
