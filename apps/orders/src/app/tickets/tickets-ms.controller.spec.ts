/* eslint-disable max-nested-callbacks */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createRmqContext,
  MockModel,
} from '@ticketing/microservices/shared/testing';
import { Channel } from 'amqp-connection-manager';

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
    it('should call "TicketsService.create" and in case of success ack RMQ message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const context = createRmqContext();
      const ticketsController =
        app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.create = jest.fn(() => Promise.resolve(ticket));
      context.getChannelRef().ack = jest.fn();
      //
      await ticketsController.onCreated(ticket, context);
      expect(ticketsService.create).toBeCalledWith(ticket);
      expect(context.getChannelRef().ack).toBeCalled();
    });

    it('should call "TicketsService.create" and in case of error NOT ack RMQ message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const context = createRmqContext();
      const expectedError = new Error('Cannot create ticket');
      const ticketsController =
        app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.create = jest
        .fn(() => {
          throw expectedError;
        })
        .mockRejectedValueOnce(expectedError);
      const channel = context.getChannelRef() as Channel;
      channel.ack = jest.fn();
      channel.nack = jest.fn();
      //
      await expect(
        ticketsController.onCreated(ticket, context),
      ).rejects.toThrowError(expectedError);
      expect(ticketsService.create).toBeCalledWith(ticket);
      expect(channel.ack).not.toBeCalled();
      expect(channel.nack).toBeCalled();
    });
  });

  describe('onUpdated()', () => {
    it('should call "TicketsService.updatedById" and in case of success, ack RMQ message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const context = createRmqContext();
      const ticketsController =
        app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.updateById = jest.fn(() => Promise.resolve(ticket));
      context.getChannelRef().ack = jest.fn();
      //
      await ticketsController.onUpdated(ticket, context);
      expect(ticketsService.updateById).toBeCalledWith(ticket.id, ticket);
      expect(context.getChannelRef().ack).toBeCalled();
    });

    it('should call "TicketsService.updatedById" and in case of error, NOT ack RMQ message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const context = createRmqContext();
      const expectedError = new Error('Cannot create ticket');
      const ticketsController =
        app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.updateById = jest
        .fn(() => {
          throw expectedError;
        })
        .mockRejectedValueOnce(expectedError);
      const channel = context.getChannelRef() as Channel;
      channel.ack = jest.fn();
      channel.nack = jest.fn();
      //
      await expect(
        ticketsController.onUpdated(ticket, context),
      ).rejects.toThrowError(expectedError);
      expect(ticketsService.updateById).toBeCalledWith(ticket.id, ticket);
      expect(channel.ack).not.toBeCalled();
      expect(channel.nack).toBeCalled();
    });
  });
});
