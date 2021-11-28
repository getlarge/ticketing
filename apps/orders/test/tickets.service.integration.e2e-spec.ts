/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { loadEnv } from '@ticketing/microservices/shared/env';
import { Model, Types } from 'mongoose';

import {
  Ticket as TicketSchema,
  TicketDocument,
} from '../src/app/tickets/schemas';
import { TicketsModule } from '../src/app/tickets/tickets.module';
import { TicketsService } from '../src/app/tickets/tickets.service';
import { envFilePath } from './constants';
import { mockTicketEvent } from './models/ticket.mock';

describe('TicketsService', () => {
  let app: TestingModule;
  let ticketsService: TicketsService;
  let ticketModel: Model<TicketDocument>;
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
    }).compile();

    ticketsService = app.get<TicketsService>(TicketsService);
    ticketModel = app.get<Model<TicketDocument>>(
      getModelToken(TicketSchema.name)
    );
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
      await expect(ticketsService.create(ticket as any)).rejects.toThrowError();
      const tickets = await ticketModel.find();
      expect(tickets.length).toBe(0);
    });

    it('should store valid ticket in Mongo', async () => {
      const ticket = mockTicketEvent();
      //
      await ticketsService.create(ticket);
      const tickets = await ticketModel.find();
      expect(tickets.length).toBe(1);
    });
  });

  describe('findById()', () => {
    it('should throw NotFoundException when no ticket is found', async () => {
      await expect(
        ticketsService.findById(new Types.ObjectId().toHexString())
      ).rejects.toThrowError(NotFoundException);
    });

    it('should return serialized ticket when found', async () => {
      const ticketEvent = mockTicketEvent();
      const ticket = await ticketModel.create({
        ...ticketEvent,
        _id: ticketEvent.id,
      });
      const ticketId = ticket._id.toString();
      //
      const foundTicket = await ticketsService.findById(ticketId);
      expect(foundTicket.id).toBe(ticketId);
    });
  });

  describe('findByEventVersion()', () => {
    it('should throw NotFoundException when no ticket is found', async () => {
      await expect(
        ticketsService.findByEventVersion({
          id: new Types.ObjectId().toHexString(),
          version: 3,
        })
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw NotFoundException when ticket version is too far in the future', async () => {
      const ticket = await ticketModel.create(mockTicketEvent());
      const ticketId = ticket._id.toString();
      const ticketVersion = ticket.version;
      //
      await expect(
        ticketsService.findByEventVersion({
          id: ticketId,
          version: ticketVersion + 3,
        })
      ).rejects.toThrowError(NotFoundException);
    });

    it('should return serialized ticket when found ticket with version-1', async () => {
      const ticketEvent = mockTicketEvent();
      const ticket = await ticketModel.create({
        ...ticketEvent,
        _id: ticketEvent.id,
      });
      const ticketId = ticket._id.toString();
      const ticketVersion = ticket.version;
      //
      const foundTicket = await ticketsService.findByEventVersion({
        id: ticketId,
        version: ticketVersion + 1,
      });
      expect(foundTicket.id).toBe(ticketId);
    });
  });

  describe('updateById()', () => {
    it('should NOT update a ticket when its version is too far in the future', async () => {
      const ticketEvent = mockTicketEvent();
      await ticketModel.create({ ...ticketEvent, _id: ticketEvent.id });
      ticketEvent.price = 300;
      ticketEvent.version = 300;
      //
      await expect(
        ticketsService.updateById(ticketEvent.id, ticketEvent)
      ).rejects.toThrowError(NotFoundException);
    });

    it('should update a ticket when it is valid', async () => {
      const ticketEvent = mockTicketEvent();
      const ticket = await ticketModel.create({
        ...ticketEvent,
        _id: ticketEvent.id,
      });
      ticketEvent.price = 300;
      ticketEvent.version = ticket.version + 1;
      //
      const updatedTicket = await ticketsService.updateById(
        ticketEvent.id,
        ticketEvent
      );
      expect(updatedTicket.price).not.toEqual(ticket.price);
      expect(updatedTicket.price).toEqual(ticketEvent.price);
    });
  });
});
