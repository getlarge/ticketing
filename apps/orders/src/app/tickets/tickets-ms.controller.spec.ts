/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import {
  createNatsContext,
  MockModel,
} from '@ticketing/microservices/shared/testing';

import { mockTicketEvent } from '../../../test/models/ticket.mock';
import { TicketsService } from './tickets.service';
import { TicketsMSController } from './tickets-ms.controller';

describe('TicketsMSController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [
        TicketsMSController,
        {
          provide: TicketsService,
          useValue: new TicketsService(new MockModel() as any),
        },
      ],
    }).compile();
  });

  describe('onCreated()', () => {
    it('should call "TicketsService.create" and in case of success ack NATS message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const context = createNatsContext();
      const ticketsController = app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.create = jest.fn();
      context.message.ack = jest.fn();
      //
      await ticketsController.onCreated(ticket, context);
      expect(ticketsService.create).toBeCalledWith(ticket);
      expect(context.message.ack).toBeCalled();
    });

    it('should call "TicketsService.create" and in case of error NOT ack NATS message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const context = createNatsContext();
      const expectedError = new Error('Cannot create ticket');
      const ticketsController = app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.create = jest.fn().mockRejectedValueOnce(expectedError);
      context.message.ack = jest.fn();
      //
      await expect(
        ticketsController.onCreated(ticket, context)
      ).rejects.toThrowError(expectedError);
      expect(ticketsService.create).toBeCalledWith(ticket);
      expect(context.message.ack).not.toBeCalled();
    });
  });

  describe('onUpdated()', () => {
    it('should call "TicketsService.updatedById" and in case of success, ack NATS message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const context = createNatsContext();
      const ticketsController = app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.updateById = jest.fn();
      context.message.ack = jest.fn();
      //
      await ticketsController.onUpdated(ticket, context);
      expect(ticketsService.updateById).toBeCalledWith(ticket.id, ticket);
      expect(context.message.ack).toBeCalled();
    });

    it('should call "TicketsService.updatedById" and in case of error, NOT ack NATS message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const context = createNatsContext();
      const expectedError = new Error('Cannot create ticket');
      const ticketsController = app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.updateById = jest
        .fn()
        .mockRejectedValueOnce(expectedError);
      context.message.ack = jest.fn();
      //
      await expect(
        ticketsController.onUpdated(ticket, context)
      ).rejects.toThrowError(expectedError);
      expect(ticketsService.updateById).toBeCalledWith(ticket.id, ticket);
      expect(context.message.ack).not.toBeCalled();
    });
  });
});
