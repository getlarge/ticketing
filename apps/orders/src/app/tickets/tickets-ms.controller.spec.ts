/* eslint-disable max-nested-callbacks */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMock } from '@golevelup/ts-jest';
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { mockTicketEvent } from '../../../test/models/ticket.mock';
import { TicketDocument } from './schemas';
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
          useValue: new TicketsService(createMock<Model<TicketDocument>>()),
        },
      ],
    }).compile();
  });

  describe('onCreated()', () => {
    it('should call "TicketsService.create" and in case of success ack RMQ message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const ticketsController =
        app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.create = jest.fn(() => Promise.resolve(ticket));
      //
      await ticketsController.onCreated(ticket);
      expect(ticketsService.create).toBeCalledWith(ticket);
    });

    it('should call "TicketsService.create" and in case of error NOT ack RMQ message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const expectedError = new Error('Cannot create ticket');
      const ticketsController =
        app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.create = jest
        .fn(() => {
          throw expectedError;
        })
        .mockRejectedValueOnce(expectedError);
      //
      await expect(ticketsController.onCreated(ticket)).rejects.toThrowError(
        expectedError,
      );
      expect(ticketsService.create).toBeCalledWith(ticket);
    });
  });

  describe('onUpdated()', () => {
    it('should call "TicketsService.updatedById" and in case of success, ack RMQ message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const ticketsController =
        app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.updateById = jest.fn(() => Promise.resolve(ticket));
      //
      await ticketsController.onUpdated(ticket);
      expect(ticketsService.updateById).toBeCalledWith(ticket.id, ticket);
    });

    it('should call "TicketsService.updatedById" and in case of error, NOT ack RMQ message', async () => {
      // ticket coming from tickets-service
      const ticket = mockTicketEvent();
      const expectedError = new Error('Cannot create ticket');
      const ticketsController =
        app.get<TicketsMSController>(TicketsMSController);
      const ticketsService = app.get<TicketsService>(TicketsService);
      ticketsService.updateById = jest
        .fn(() => {
          throw expectedError;
        })
        .mockRejectedValueOnce(expectedError);
      //
      await expect(ticketsController.onUpdated(ticket)).rejects.toThrowError(
        expectedError,
      );
      expect(ticketsService.updateById).toBeCalledWith(ticket.id, ticket);
    });
  });
});
