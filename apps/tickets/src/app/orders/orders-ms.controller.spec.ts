/* eslint-disable max-nested-callbacks */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMock } from '@golevelup/ts-jest';
import { jest } from '@jest/globals';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { MockOryRelationshipsService } from '@ticketing/microservices/shared/testing';
import { Model } from 'mongoose';

import { mockOrderEvent } from '../../../test/models/order.mock';
import { mockTicket } from '../../../test/models/ticket.mock';
import { TicketDocument } from '../tickets/schemas';
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
            createMock<Model<TicketDocument>>(),
            new MockOryRelationshipsService() as any,
            createMock<ClientProxy>(),
          ),
        },
      ],
    }).compile();
  });

  describe('onCreated()', () => {
    it('should call "TicketsService.createOrder" and in case of success ack RMQ message', async () => {
      // ticket coming from tickets-service
      const order = mockOrderEvent();
      const ticket = mockTicket(order.ticket);
      const ordersMSController = app.get(OrdersMSController);
      const ticketsService = app.get(TicketsService);
      ticketsService.createOrder = jest.fn(() => Promise.resolve(ticket));
      //
      await ordersMSController.onCreated(order);
      expect(ticketsService.createOrder).toBeCalledWith(order);
    });

    it('should call "TicketsService.createOrder" and in case of error NOT ack RMQ message', async () => {
      // ticket coming from tickets-service
      const order = mockOrderEvent();
      const expectedError = new Error('Cannot create ticket');
      const ordersMSController = app.get(OrdersMSController);
      const ticketsService = app.get(TicketsService);
      ticketsService.createOrder = jest
        .fn(() => {
          throw expectedError;
        })
        .mockRejectedValueOnce(expectedError);
      //
      await expect(ordersMSController.onCreated(order)).rejects.toThrowError(
        expectedError,
      );
      expect(ticketsService.createOrder).toBeCalledWith(order);
    });
  });

  describe('onCancelled()', () => {
    it('should call "TicketsService.cancelOrder"', async () => {
      // ticket coming from tickets-service
      const order = mockOrderEvent();
      const ordersMSController = app.get(OrdersMSController);
      const ticketsService = app.get(TicketsService);
      ticketsService.cancelOrder = jest.fn(() =>
        Promise.resolve(mockTicket(order.ticket)),
      );
      //
      await ordersMSController.onCancelled(order);
      expect(ticketsService.cancelOrder).toBeCalledWith(order);
    });

    it('should call "TicketsService.cancelOrder" and in case of error, NOT ack RMQ message', async () => {
      // ticket coming from tickets-service
      const order = mockOrderEvent();
      const expectedError = new Error('Cannot create ticket');
      const ordersMSController = app.get(OrdersMSController);
      const ticketsService = app.get(TicketsService);
      ticketsService.cancelOrder = jest
        .fn(() => {
          throw expectedError;
        })
        .mockRejectedValueOnce(expectedError);
      //
      await expect(ordersMSController.onCancelled(order)).rejects.toThrowError(
        expectedError,
      );
      expect(ticketsService.cancelOrder).toBeCalledWith(order);
    });
  });
});
