import { ConfigModule, ConfigService } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Publisher } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { MockClient } from '@ticketing/microservices/shared/testing';
import { Model, Types } from 'mongoose';

import { AppConfigService } from '../env';
import { Ticket, TicketDocument } from './schemas';
import { TicketsModule } from './tickets.module';

describe('Tickets', () => {
  let ticketModel: Model<TicketDocument>;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          expandVariables: true,
        }),
        MongooseModule.forRootAsync({
          useFactory: (configService: AppConfigService) => ({
            uri: configService.get<string>('MONGODB_URI'),
          }),
          inject: [ConfigService],
        }),
        TicketsModule,
      ],
    })
      .overrideProvider(Publisher)
      .useValue(new MockClient())
      .compile();

    ticketModel = app.get(getModelToken(Ticket.name));
  });

  describe('TicketSchema', () => {
    it('should increment version number on multiple saves', async () => {
      const ticket = await ticketModel.create({
        title: 'title',
        price: 0,
        userId: new Types.ObjectId().toString(),
      });

      expect(ticket.version).toEqual(0);
      await ticket.save();
      expect(ticket.version).toEqual(1);
      await ticket.save();
      expect(ticket.version).toEqual(2);
    });

    it('should implements Optimistic Concurrency Control', async () => {
      const ticket = await ticketModel.create({
        title: 'title',
        price: 0,
        userId: new Types.ObjectId().toString(),
      });
      const firstInstance = await ticketModel.findById(ticket._id);
      const secondInstance = await ticketModel.findById(ticket._id);
      firstInstance.set({ price: 10 });
      secondInstance.set({ price: 15 });
      await firstInstance.save();
      await expect(secondInstance.save()).rejects.toThrow();
    });
  });
});
