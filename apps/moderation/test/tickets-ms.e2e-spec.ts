/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { INestMicroservice } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { CustomStrategy } from '@nestjs/microservices';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AmqpClient, AmqpServer } from '@s1seven/nestjs-tools-amqp-transport';
import { loadEnv, validate } from '@ticketing/microservices/shared/env';
import { Patterns } from '@ticketing/microservices/shared/events';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { getReplyQueueName } from '@ticketing/microservices/shared/rmq';
import { Services } from '@ticketing/shared/constants';
import { Ticket, TicketStatus } from '@ticketing/shared/models';
import { Model, Types } from 'mongoose';
import { delay, lastValueFrom } from 'rxjs';

import { EnvironmentVariables } from '../src/app/env';
import { TICKET_CREATED_EVENT } from '../src/app/shared/events';
import {
  Ticket as TicketModel,
  TicketDocument,
} from '../src/app/tickets/schemas';
import { TicketsModule } from '../src/app/tickets/tickets.module';

describe('TicketsMSController (e2e)', () => {
  const envFilePath = 'apps/moderation/.env.test';
  const envVariables = loadEnv(envFilePath, true);

  let app: NestFastifyApplication;
  let microservice: INestMicroservice;
  let ticketRmqPublisher: AmqpClient;
  let ticketModel: Model<TicketDocument>;
  let eventEmitter: EventEmitter2;

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
        EventEmitterModule.forRoot({
          wildcard: true,
          delimiter: '/',
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    const configService = app.get(ConfigService);
    const rmqUrl = configService.get('RMQ_URL') as string;
    const moderationQueue = `${Services.ORDERS_SERVICE}_QUEUE_TEST`;

    ticketRmqPublisher = new AmqpClient({
      urls: [rmqUrl],
      persistent: false,
      noAck: false,
      prefetchCount: 1,
      isGlobalPrefetchCount: false,
      queue: moderationQueue,
      replyQueue: `${getReplyQueueName(
        Services.MODERATION_SERVICE,
        Services.TICKETS_SERVICE,
      )}_TEST`,
      queueOptions: {
        durable: false,
        exclusive: false,
        autoDelete: false,
      },
      socketOptions: {
        keepAlive: true,
        heartbeatIntervalInSeconds: 30,
        reconnectTimeInSeconds: 1,
      },
    });

    const options: CustomStrategy = {
      strategy: new AmqpServer({
        urls: [rmqUrl],
        persistent: false,
        noAck: false,
        prefetchCount: 1,
        isGlobalPrefetchCount: false,
        queue: moderationQueue,
        queueOptions: {
          durable: false,
          exclusive: false,
          autoDelete: false,
        },
        socketOptions: {
          keepAlive: true,
          heartbeatIntervalInSeconds: 30,
          reconnectTimeInSeconds: 1,
        },
      }),
    };
    microservice = moduleFixture.createNestMicroservice(options);
    ticketModel = app.get(getModelToken(TicketModel.name));
    eventEmitter = app.get(EventEmitter2);

    await microservice.listen();
    await app.init();
  });

  afterAll(async () => {
    ticketRmqPublisher?.close();
    await microservice?.close();
    await app?.close();
  });

  describe('should be defined', () => {
    it('should be defined', () => {
      expect(app).toBeDefined();
      expect(microservice).toBeDefined();
      expect(ticketRmqPublisher).toBeDefined();
      expect(ticketModel).toBeDefined();
    });
  });

  describe('ticket.created', () => {
    it('should NOT create ticket when event data is invalid', async () => {
      const ticket = {
        id: new Types.ObjectId().toHexString(),
        title: 3000,
        price: 'not a price',
        version: 'invalid version',
      };
      //
      const response = await lastValueFrom(
        ticketRmqPublisher
          .send(Patterns.TicketCreated, ticket)
          .pipe(delay(500)),
      );
      console.warn('response', response);
      expect(response).toHaveProperty('name', 'AcceptableError');
      expect(response).toHaveProperty('statusCode', 400);
      expect(response).toHaveProperty('path', Patterns.TicketCreated);
      expect(response).toHaveProperty('details');
      expect(response).toHaveProperty('errors');
      const createdTicket = await ticketModel.findOne({ _id: ticket.id });
      expect(createdTicket).toBeUndefined();
    }, 6000);

    it('should create ticket when event data is valid', async () => {
      const ticket: Ticket = {
        id: new Types.ObjectId().toHexString(),
        title: 'valid title',
        price: 100,
        version: 0,
        status: TicketStatus.WaitingModeration,
        userId: new Types.ObjectId().toHexString(),
      };
      let eventEmitted = false;
      //
      eventEmitter.once(TICKET_CREATED_EVENT, () => {
        eventEmitted = true;
      });
      const response = await lastValueFrom(
        ticketRmqPublisher
          .send(Patterns.TicketCreated, ticket)
          .pipe(delay(500)),
      );
      //
      expect(response).toHaveProperty('id', ticket.id);
      expect(response).toHaveProperty('title', ticket.title);
      const createdTicket = await ticketModel.findOne({ _id: ticket.id });
      expect(createdTicket?._id?.toString()).toEqual(ticket.id);
      expect(eventEmitted).toBe(true);
    }, 6000);
  });
});
