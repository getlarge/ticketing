/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { Publisher } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { loadEnv, validate } from '@ticketing/microservices/shared/env';
import { Patterns } from '@ticketing/microservices/shared/events';
import { HttpErrorFilter } from '@ticketing/microservices/shared/filters';
import {
  createSigninSession,
  MockClient,
} from '@ticketing/microservices/shared/testing';
import { randomBytes } from 'crypto';
import fastifyPassport from 'fastify-passport';
import fastifySecureSession from 'fastify-secure-session';
import { Types } from 'mongoose';

import { AppConfigService, EnvironmentVariables } from '../src/app/env';
import { CreateTicket } from '../src/app/tickets/models';
import {
  Ticket as TicketSchema,
  TicketModel,
} from '../src/app/tickets/schemas/ticket.schema';
import { TicketsModule } from '../src/app/tickets/tickets.module';
import { envFilePath } from './constants';
import { createTicket } from './helpers';

const defaultUserEmail = 'test@test.com';

describe('TicketsController (e2e)', () => {
  let app: NestFastifyApplication;
  let ticketModel: TicketModel;
  let natsClient: MockClient;
  const envVariables = loadEnv(envFilePath, true);

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
      providers: [
        {
          provide: APP_FILTER,
          useClass: HttpErrorFilter,
        },
      ],
    })
      .overrideProvider(Publisher)
      .useValue(new MockClient())
      .compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());

    const configService = app.get<AppConfigService>(ConfigService);
    app.register(fastifySecureSession, {
      key: configService.get('SESSION_KEY'),
      cookie: {
        secure: false,
        signed: false,
      },
    });
    app.register(fastifyPassport.initialize());
    app.register(fastifyPassport.secureSession());

    ticketModel = app.get<TicketModel>(getModelToken(TicketSchema.name));
    natsClient = app.get(Publisher);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/tickets (POST)', () => {
    const url = '/tickets';

    it('should have a "tickets" endpoint for POST requests', async () => {
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        payload: {},
      });
      //
      expect(statusCode).toBeDefined();
      expect(statusCode).not.toBe(404);
    });

    it('should forbid access to unauthorized users', async () => {
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        payload: {},
      });
      //
      expect(statusCode).toBe(401);
    });

    it('should return a 400 if an invalid title is provided', async () => {
      const session = createSigninSession(app, { email: defaultUserEmail });
      const invalidTicket: CreateTicket = { title: '', price: 10 };
      //
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        cookies: { session },
        payload: invalidTicket,
      });
      expect(statusCode).toBe(400);
    });

    it('should return a 400 if an invalid price is provided', async () => {
      const session = createSigninSession(app, { email: defaultUserEmail });
      const invalidTicket: CreateTicket = { title: 'ticket title', price: -10 };
      //
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        cookies: { session },
        payload: invalidTicket,
      });
      expect(statusCode).toBe(400);
    });

    it('should create a ticket with valid input and publish an event', async () => {
      const userId = 'fake_user_id';
      const session = createSigninSession(app, {
        email: defaultUserEmail,
        id: userId,
      });
      const ticket: CreateTicket = { title: 'ticket title', price: 10 };
      //

      let tickets = await ticketModel.find();
      expect(tickets.length).toBe(0);

      const { payload, statusCode } = await app.inject({
        method: 'POST',
        url,
        cookies: { session },
        payload: ticket,
      });
      //
      expect(statusCode).toBe(201);
      const body = JSON.parse(payload);
      expect(body).toHaveProperty('title');
      expect(body).toEqual(expect.objectContaining(ticket));
      expect(body.userId).toBe(userId);

      tickets = await ticketModel.find();
      expect(tickets.length).toBe(1);
      expect(natsClient.emit).toBeCalledWith(Patterns.TicketCreated, body);
    });
  });

  describe('/tickets (GET)', () => {
    const url = '/tickets';

    it('should return all tickets', async () => {
      const ticketsToCreate = [
        { title: 'title1' },
        { title: 'title2' },
        { title: 'title3' },
      ];
      await Promise.all(
        ticketsToCreate.map((ticketToCreate) =>
          createTicket(ticketToCreate, ticketModel)
        )
      );
      //
      const { payload, statusCode } = await app.inject({
        method: 'GET',
        url,
      });
      //
      expect(statusCode).toBe(200);
      const body = JSON.parse(payload);
      expect(body.length).toEqual(ticketsToCreate.length);
    });
  });

  describe('/tickets/:id (GET)', () => {
    const baseUrl = '/tickets';

    it('should return 404 if ticket is not found', async () => {
      const { statusCode } = await app.inject({
        method: 'GET',
        url: `${baseUrl}/non_existant`,
      });
      //
      expect(statusCode).toBe(404);
    });

    it('should return the ticket if it exists', async () => {
      const ticketToCreate = {
        title: 'title',
        price: 20,
        userId: randomBytes(4).toString('hex'),
      };
      await ticketModel.create(ticketToCreate);
      const ticket = await ticketModel.findOne({
        userId: ticketToCreate.userId,
      });
      //
      const { payload, statusCode } = await app.inject({
        method: 'GET',
        url: `${baseUrl}/${ticket._id}`,
      });
      //
      expect(statusCode).toBe(200);
      const body = JSON.parse(payload);
      expect(body.id).toEqual(ticket._id.toString());
      expect(body.title).toEqual(ticket.title);
    });
  });

  describe('/tickets/:id (PUT)', () => {
    const baseUrl = '/tickets';

    it('should return 404 if ticket is not found', async () => {
      const session = createSigninSession(app, { email: defaultUserEmail });
      const ticketUpdate: CreateTicket = {
        title: 'title-updated',
        price: 19,
      };
      const { statusCode } = await app.inject({
        method: 'PUT',
        url: `${baseUrl}/non_existant`,
        cookies: { session },
        payload: ticketUpdate,
      });
      //
      expect(statusCode).toBe(404);
    });

    it('should return 401 if the user is not authenticated', async () => {
      const { id } = await createTicket({}, ticketModel);
      //
      const { statusCode } = await app.inject({
        method: 'PUT',
        url: `${baseUrl}/${id}`,
      });
      //
      expect(statusCode).toBe(401);
    });

    it('should return 403 if the user is not the owner', async () => {
      const session = createSigninSession(app, { email: defaultUserEmail });
      const { id, title, price } = await createTicket({}, ticketModel);
      const ticketUpdate: CreateTicket = {
        title: 'title-updated',
        price: 19,
      };
      //
      const { statusCode } = await app.inject({
        method: 'PUT',
        url: `${baseUrl}/${id}`,
        cookies: { session },
        payload: ticketUpdate,
      });
      //
      expect(statusCode).toBe(403);
      const ticket = await ticketModel.findOne({ _id: id });
      expect(ticket._id.toString()).toEqual(id);
      expect(ticket.title).toEqual(title);
      expect(ticket.price).toEqual(price);
    });

    it('should return a 400 if an invalid price or title is provided', async () => {
      const session = createSigninSession(app, { email: defaultUserEmail });
      const { id } = await createTicket({}, ticketModel);
      const invalidTicket: CreateTicket = { title: '', price: -10 };
      const expectedErrors = [
        {
          message: 'title must be a between 3 and 56 characters',
        },
        {
          message: 'price must not be less than 0',
        },
      ];
      //
      const { payload, statusCode } = await app.inject({
        method: 'PUT',
        url: `${baseUrl}/${id}`,
        cookies: { session },
        payload: invalidTicket,
      });
      expect(statusCode).toBe(400);
      const body = JSON.parse(payload);
      expect(body.errors).toEqual(expectedErrors);
    });

    it('should update and return the ticket and publish an event when it exists and user is owner', async () => {
      const userId = new Types.ObjectId().toHexString();
      const session = createSigninSession(app, {
        email: defaultUserEmail,
        id: userId,
      });
      const { id } = await createTicket({ userId }, ticketModel);
      const ticketUpdate: CreateTicket = {
        title: 'title-updated',
        price: 19,
      };
      //
      const { payload, statusCode } = await app.inject({
        method: 'PUT',
        url: `${baseUrl}/${id}`,
        cookies: { session },
        payload: ticketUpdate,
      });
      //
      expect(statusCode).toBe(200);
      const body = JSON.parse(payload);
      expect(body.id).toEqual(id);
      expect(body.title).toEqual(ticketUpdate.title);
      expect(body.price).toEqual(ticketUpdate.price);
      expect(natsClient.emit).toBeCalledWith(Patterns.TicketUpdated, body);
    });
  });
});
