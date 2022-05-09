/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { INestMicroservice } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomStrategy } from '@nestjs/microservices';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Listener,
  Publisher,
} from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { loadEnv, validate } from '@ticketing/microservices/shared/env';
import { Patterns } from '@ticketing/microservices/shared/events';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { Resources, Services } from '@ticketing/shared/constants';
import { Model, Types } from 'mongoose';
import { delay, lastValueFrom } from 'rxjs';

import { AppConfigService, EnvironmentVariables } from '../src/app/env';
import { Ticket, TicketDocument } from '../src/app/tickets/schemas';
import { TicketsModule } from '../src/app/tickets/tickets.module';
import { TicketsService } from '../src/app/tickets/tickets.service';
import { envFilePath } from './constants';
import { mockTicketEvent } from './models/ticket.mock';

describe('TicketsMSController (e2e)', () => {
  let app: NestFastifyApplication;
  let microservice: INestMicroservice;
  let natsPublisher: Publisher;
  let ticketModel: Model<TicketDocument>;
  const envVariables = loadEnv(envFilePath, true);

  const exceptionFilter = new GlobalErrorFilter();
  exceptionFilter.catch = jest.fn();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          expandVariables: true,
          envFilePath,
          validate: validate(EnvironmentVariables),
          load: [() => envVariables],
        }),
        TicketsModule,
        MongooseModule.forRoot(envVariables['MONGODB_URI']),
      ],
    })
      .overrideProvider(GlobalErrorFilter)
      .useValue(exceptionFilter)
      .compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    const configService = app.get<AppConfigService>(ConfigService);

    natsPublisher = new Publisher({
      clusterId: configService.get('NATS_CLUSTER_ID'),
      clientId: configService.get('NATS_CLIENT_ID'),
      connectOptions: {
        url: configService.get('NATS_URL'),
        name: `${Services.ORDERS_SERVICE}_${Resources.ORDERS}_test`,
      },
    });

    const options: CustomStrategy = {
      strategy: new Listener(
        configService.get('NATS_CLUSTER_ID'),
        configService.get('NATS_CLIENT_ID'),
        `${Services.ORDERS_SERVICE}_GROUP_TEST`,
        { url: configService.get('NATS_URL') },
        {
          durableName: `${Resources.TICKETS}_subscriptions_test`,
          manualAckMode: false,
          // deliverAllAvailable: true,
          // ackWait: 5 * 1000,
        }
      ),
    };
    microservice = moduleFixture.createNestMicroservice(options);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ticketModel = app.get<Model<TicketDocument>>(getModelToken(Ticket.name));

    await microservice.listen();
    await app.init();
  });

  afterAll(async () => {
    natsPublisher.close();
    await microservice.close();
    await app.close();
  });

  describe('ticket:created', () => {
    it('should NOT create ticket when event data is invalid', async () => {
      const ticket = {
        id: new Types.ObjectId().toHexString(),
        title: 3000,
        price: 'not a price',
        version: 'invalid version',
      };
      const ticketsService = app.get(TicketsService);
      ticketsService.create = jest.fn();
      //
      await lastValueFrom(
        natsPublisher.emit(Patterns.TicketCreated, ticket).pipe(delay(500))
      );
      expect(ticketsService.create).not.toBeCalled();
      expect(exceptionFilter.catch).toHaveBeenCalled();
    }, 6000);

    it('should create ticket when event data is valid', async () => {
      const ticket = mockTicketEvent();
      const ticketsService = app.get(TicketsService);
      ticketsService.create = jest.fn();
      //
      await lastValueFrom(
        natsPublisher.emit(Patterns.TicketCreated, ticket).pipe(delay(500))
      );
      expect(ticketsService.create).toBeCalled();
      // const createdTicket = await ticketModel.findOne({ _id: ticket.id });
      // expect(createdTicket?._id?.toString()).toEqual(ticket.id);
    }, 6000);
  });
});
