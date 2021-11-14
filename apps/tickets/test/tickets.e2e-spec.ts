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
import { loadEnv, validate } from '@ticketing/microservices/shared/env';
import { HttpErrorFilter } from '@ticketing/microservices/shared/filters';
import { CreateTicket } from '@ticketing/shared/models';
import fastifyPassport from 'fastify-passport';
import fastifySecureSession from 'fastify-secure-session';

import { AppConfigService, EnvironmentVariables } from '../src/app/env';
import {
  Ticket as TicketSchema,
  TicketModel,
} from '../src/app/tickets/schemas/ticket.schema';
import { TicketsModule } from '../src/app/tickets/tickets.module';
import { envFilePath } from './constants';
import { createSigninSession } from './helpers';

const defaultUserEmail = 'test@test.com';

describe('TicketsController (e2e)', () => {
  let app: NestFastifyApplication;
  let ticketModel: TicketModel;
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
    }).compile();

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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/tickets (POST)', () => {
    const url = '/tickets';

    it('should have a tickets endpoint for POST requests', async () => {
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

    it('should return an error if an invalid title is provided', async () => {
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

    it('should return an error if an invalid price is provided', async () => {
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

    it('should create a ticket with valid input', async () => {
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
    });
  });
});
