/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import {
  createRmqContext,
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
      const context = createRmqContext();
      const ticketsController =
        app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.create = jest.fn();
      context.getChannelRef().ack = jest.fn();
      //
      await ticketsController.onCreated(ticket, context);
      expect(ticketsService.create).toBeCalledWith(ticket);
      expect(context.getChannelRef().ack).toBeCalled();
    });

    it('should call "TicketsService.create" and in case of error NOT ack NATS message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const context = createRmqContext();
      const expectedError = new Error('Cannot create ticket');
      const ticketsController =
        app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.create = jest.fn().mockRejectedValueOnce(expectedError);
      context.getChannelRef().ack = jest.fn();
      //
      await expect(
        ticketsController.onCreated(ticket, context),
      ).rejects.toThrowError(expectedError);
      expect(ticketsService.create).toBeCalledWith(ticket);
      expect(context.getChannelRef().ack).not.toBeCalled();
    });
  });

  describe('onUpdated()', () => {
    it('should call "TicketsService.updatedById" and in case of success, ack NATS message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const context = createRmqContext();
      const ticketsController =
        app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.updateById = jest.fn();
      context.getChannelRef().ack = jest.fn();
      //
      await ticketsController.onUpdated(ticket, context);
      expect(ticketsService.updateById).toBeCalledWith(ticket.id, ticket);
      expect(context.getChannelRef().ack).toBeCalled();
    });

    it('should call "TicketsService.updatedById" and in case of error, NOT ack NATS message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const context = createRmqContext();
      const expectedError = new Error('Cannot create ticket');
      const ticketsController =
        app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.updateById = jest
        .fn()
        .mockRejectedValueOnce(expectedError);
      context.getChannelRef().ack = jest.fn();
      //
      await expect(
        ticketsController.onUpdated(ticket, context),
      ).rejects.toThrowError(expectedError);
      expect(ticketsService.updateById).toBeCalledWith(ticket.id, ticket);
      expect(context.getChannelRef().ack).not.toBeCalled();
    });
  });
});
