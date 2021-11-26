/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import {
  createNatsContext,
  MockModel,
} from '@ticketing/microservices/shared/testing';
import { Ticket } from '@ticketing/shared/models';
import { Types } from 'mongoose';

import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

describe('TicketsController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [
        TicketsController,
        {
          provide: TicketsService,
          useValue: new TicketsService(new MockModel() as any),
        },
      ],
    }).compile();
  });

  describe('create()', () => {
    it('should call "TicketsService.create" and in case of success ack NATS message', async () => {
      // ticket coming from tickets-service
      const ticket: Ticket = {
        id: new Types.ObjectId().toHexString(),
        userId: new Types.ObjectId().toHexString(),
        title: '',
        price: 2,
        version: 1,
      };
      const context = createNatsContext();
      const ticketsController = app.get<TicketsController>(TicketsController);
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
      const ticket: Ticket = {
        id: new Types.ObjectId().toHexString(),
        userId: new Types.ObjectId().toHexString(),
        title: '',
        price: 2,
        version: 1,
      };
      const context = createNatsContext();
      const expectedError = new Error('Cannot create ticket');
      const ticketsController = app.get<TicketsController>(TicketsController);
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
});
