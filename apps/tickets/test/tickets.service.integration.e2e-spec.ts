/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Publisher } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { loadEnv } from '@ticketing/microservices/shared/env';
import { Patterns } from '@ticketing/microservices/shared/events';
import { MockClient } from '@ticketing/microservices/shared/testing';
import { Model, Types } from 'mongoose';
import { of } from 'rxjs';

import {
  Ticket as TicketSchema,
  TicketDocument,
} from '../src/app/tickets/schemas';
import { TicketsModule } from '../src/app/tickets/tickets.module';
import { TicketsService } from '../src/app/tickets/tickets.service';
import { envFilePath } from './constants';
import { mockOrderEvent } from './models/order.mock';
import { mockTicket } from './models/ticket.mock';
import { mockCurrentUser } from './models/user.mock';

describe('TicketsService', () => {
  let app: TestingModule;
  let ticketsService: TicketsService;
  let ticketModel: Model<TicketDocument>;
  const natsClient = new MockClient();
  const envVariables = loadEnv(envFilePath, true);

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          expandVariables: true,
          envFilePath,
          load: [() => envVariables],
        }),
        TicketsModule,
        MongooseModule.forRoot(envVariables['MONGODB_URI']),
      ],
    })
      .overrideProvider(Publisher)
      .useValue(natsClient)
      .compile();

    ticketsService = app.get(TicketsService);
    ticketModel = app.get<Model<TicketDocument>>(
      getModelToken(TicketSchema.name)
    );
  });

  beforeEach(() => {
    natsClient.emit.mockReset();
  });

  describe('create()', () => {
    it('should NOT store invalid ticket in Mongo', async () => {
      const ticket = {
        id: 'invalid id',
        title: 3000,
        price: 'not a price',
        version: 'invalid version',
      };
      //
      await expect(
        ticketsService.create(ticket as any, mockCurrentUser())
      ).rejects.toThrowError();
      const tickets = await ticketModel.find();
      expect(tickets.length).toBe(0);
    });

    it('should store valid ticket in Mongo', async () => {
      const ticket = mockTicket();
      const currentUser = mockCurrentUser();
      //
      await ticketsService.create(ticket, currentUser);
      const tickets = await ticketModel.find();
      expect(tickets.length).toBe(1);
      expect(natsClient.emit).toBeCalledWith(
        Patterns.TicketCreated,
        expect.anything()
      );
    });
  });

  describe('findById()', () => {
    it('should throw NotFoundException when no ticket is found', async () => {
      await expect(
        ticketsService.findById(new Types.ObjectId().toHexString())
      ).rejects.toThrowError(NotFoundException);
    });

    it('should return serialized ticket when found', async () => {
      const currentUser = mockCurrentUser();
      const ticket = await ticketModel.create({
        ...mockTicket(),
        userId: currentUser.id,
      });
      const ticketId = ticket._id.toString();
      //
      const foundTicket = await ticketsService.findById(ticketId);
      expect(foundTicket.id).toBe(ticketId);
    });
  });

  describe('updateById()', () => {
    it('should NOT update a ticket when its version is too far in the future', async () => {
      const currentUser = mockCurrentUser();
      const ticket = await ticketModel.create({
        ...mockTicket(),
        userId: currentUser.id,
      });
      //
      await expect(
        ticketsService.updateById(
          ticket._id.toString(),
          {
            price: 200,
            version: 200,
          } as any,
          currentUser
        )
      ).rejects.toThrow();
    });

    it('should update a ticket when it is valid', async () => {
      const currentUser = mockCurrentUser();
      const ticket = await ticketModel.create({
        ...mockTicket(),
        userId: currentUser.id,
      });
      //
      const updatedTicket = await ticketsService.updateById(
        ticket._id.toString(),
        { price: 200 },
        currentUser
      );
      expect(updatedTicket.price).not.toEqual(ticket.price);
      expect(updatedTicket.price).toEqual(200);
      expect(updatedTicket.version).toEqual(ticket.version + 1);
      expect(natsClient.emit).toBeCalledWith(
        Patterns.TicketUpdated,
        expect.anything()
      );
    });
  });

  describe('createOrder()', () => {
    it('should set orderId', async () => {
      const currentUser = mockCurrentUser();
      const fakeTicket = mockTicket();
      const ticket = await ticketModel.create({
        ...fakeTicket,
        userId: currentUser.id,
      });
      const order = mockOrderEvent({
        ticket: { ...fakeTicket, id: ticket._id.toString() },
      });
      natsClient.emit = jest.fn().mockReturnValue(of(''));
      //
      const updatedTicket = await ticketsService.createOrder(order);
      const foundTicket = await ticketModel.findOne({ _id: updatedTicket.id });
      expect(updatedTicket.orderId).toEqual(order.id);
      expect(foundTicket.orderId).toEqual(order.id);
      expect(natsClient.emit).toBeCalledWith(
        Patterns.TicketUpdated,
        expect.anything()
      );
    });
  });

  describe('cancelOrder()', () => {
    it('should unset orderId', async () => {
      const currentUser = mockCurrentUser();
      const fakeTicket = mockTicket();
      const ticket = await ticketModel.create({
        ...fakeTicket,
        userId: currentUser.id,
      });
      const order = mockOrderEvent({
        ticket: { ...fakeTicket, id: ticket._id.toString() },
      });
      natsClient.emit = jest.fn().mockReturnValue(of(''));
      //
      const updatedTicket = await ticketsService.cancelOrder(order);
      const foundTicket = await ticketModel.findOne({ _id: updatedTicket.id });
      expect(updatedTicket.orderId).toBeUndefined();
      expect(foundTicket.orderId).toBeUndefined();
      expect(natsClient.emit).toBeCalledWith(
        Patterns.TicketUpdated,
        expect.anything()
      );
    });
  });
});
