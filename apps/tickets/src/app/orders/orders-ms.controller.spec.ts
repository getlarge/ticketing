/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import {
  createNatsContext,
  MockModel,
  MockPublisher,
} from '@ticketing/microservices/shared/testing';

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
            new MockPublisher() as any
          ),
        },
      ],
    }).compile();
  });

  describe('onCreated()', () => {
    it('should call "TicketsService.createOrder" and in case of success ack NATS message', async () => {
      // ticket coming from tickets-service
      const order = mockOrderEvent();
      const context = createNatsContext();
      const ordersMSController = app.get(OrdersMSController);
      const ticketsService = app.get(TicketsService);
      ticketsService.createOrder = jest.fn();
      context.message.ack = jest.fn();
      //
      await ordersMSController.onCreated(order, context);
      expect(ticketsService.createOrder).toBeCalledWith(order);
      expect(context.message.ack).toBeCalled();
    });

    it('should call "TicketsService.createOrder" and in case of error NOT ack NATS message', async () => {
      // ticket coming from tickets-service
      const order = mockOrderEvent();
      const context = createNatsContext();
      const expectedError = new Error('Cannot create ticket');
      const ordersMSController = app.get(OrdersMSController);
      const ticketsService = app.get(TicketsService);
      ticketsService.createOrder = jest
        .fn()
        .mockRejectedValueOnce(expectedError);
      context.message.ack = jest.fn();
      //
      await expect(
        ordersMSController.onCreated(order, context)
      ).rejects.toThrowError(expectedError);
      expect(ticketsService.createOrder).toBeCalledWith(order);
      expect(context.message.ack).not.toBeCalled();
    });
  });

  describe('onCancelled()', () => {
    it('should call "TicketsService.cancelOrder" and in case of success, ack NATS message', async () => {
      // ticket coming from tickets-service
      const order = mockOrderEvent();
      const context = createNatsContext();
      const ordersMSController = app.get(OrdersMSController);
      const ticketsService = app.get(TicketsService);
      ticketsService.cancelOrder = jest.fn();
      context.message.ack = jest.fn();
      //
      await ordersMSController.onCancelled(order, context);
      expect(ticketsService.cancelOrder).toBeCalledWith(order);
      expect(context.message.ack).toBeCalled();
    });

    it('should call "TicketsService.cancelOrder" and in case of error, NOT ack NATS message', async () => {
      // ticket coming from tickets-service
      const order = mockOrderEvent();
      const context = createNatsContext();
      const expectedError = new Error('Cannot create ticket');
      const ordersMSController = app.get(OrdersMSController);
      const ticketsService = app.get(TicketsService);
      ticketsService.cancelOrder = jest
        .fn()
        .mockRejectedValueOnce(expectedError);
      context.message.ack = jest.fn();
      //
      await expect(
        ordersMSController.onCancelled(order, context)
      ).rejects.toThrowError(expectedError);
      expect(ticketsService.cancelOrder).toBeCalledWith(order);
      expect(context.message.ack).not.toBeCalled();
    });
  });
});
