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
import { HttpErrorFilter } from '@ticketing/microservices/shared/filters';
import {
  createSigninSession,
  MockClient,
} from '@ticketing/microservices/shared/testing';
import { randomBytes } from 'crypto';
import fastifyPassport from 'fastify-passport';
import fastifySecureSession from 'fastify-secure-session';
import { Model, Types } from 'mongoose';

import { AppConfigService, EnvironmentVariables } from '../src/app/env';
import { CreateOrder, Ticket } from '../src/app/orders/models';
import { OrdersModule } from '../src/app/orders/orders.module';
import {
  Order as OrderSchema,
  OrderDocument,
  Ticket as TicketSchema,
  TicketDocument,
} from '../src/app/orders/schemas';
import { envFilePath } from './constants';

const defaultUserEmail = 'test@test.com';

describe('OrdersController (e2e)', () => {
  let app: NestFastifyApplication;
  let orderModel: Model<OrderDocument>;
  let ticketModel: Model<TicketDocument>;
  // let natsClient: MockClient;
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
        OrdersModule,
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

    orderModel = app.get<Model<OrderDocument>>(getModelToken(OrderSchema.name));
    ticketModel = app.get<Model<TicketDocument>>(
      getModelToken(TicketSchema.name)
    );
    // natsClient = app.get(Publisher);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/orders (POST)', () => {
    const url = '/orders';

    it('should have an "orders" endpoint for POST requests', async () => {
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

    it('should return a 400 if the order is invalid', async () => {
      const session = createSigninSession(app, {
        email: defaultUserEmail,
      });
      const invalidOrder: CreateOrder = { ticketId: 'invalid ticket id' };
      //
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        cookies: { session },
        payload: invalidOrder,
      });
      expect(statusCode).toBe(400);
    });

    it('should return a 404 if ticket ordered does not exist', async () => {
      const session = createSigninSession(app, { email: defaultUserEmail });
      const invalidOrder: CreateOrder = {
        ticketId: new Types.ObjectId().toString(),
      };
      //
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        cookies: { session },
        payload: invalidOrder,
      });
      expect(statusCode).toBe(404);
    });

    xit('should return a 400 if the ticket is already reserved', async () => {
      const userId = randomBytes(4).toString('hex');
      const session = createSigninSession(app, {
        email: defaultUserEmail,
        id: userId,
      });
      const ticket = (
        await ticketModel.create({ title: 'park', price: 1 })
      ).toJSON<Ticket>();
      await orderModel.create({ ticket, userId, expiresAt: new Date() });
      const invalidOrder: CreateOrder = { ticketId: ticket.id };
      //
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        cookies: { session },
        payload: invalidOrder,
      });
      expect(statusCode).toBe(400);
    });

    it('should create an order with valid ticket', async () => {
      const userId = 'fake_user_id';
      const session = createSigninSession(app, {
        email: defaultUserEmail,
        id: userId,
      });
      const ticket = await ticketModel.create({ title: 'park', price: 1 });
      const order: CreateOrder = { ticketId: ticket.toJSON<Ticket>().id };
      //
      let orders = await orderModel.find({ ticket });
      expect(orders.length).toBe(0);
      const { payload, statusCode } = await app.inject({
        method: 'POST',
        url,
        cookies: { session },
        payload: order,
      });
      //
      expect(statusCode).toBe(201);
      const body = JSON.parse(payload);
      expect(body).toHaveProperty('ticket');
      expect(body.userId).toBe(userId);
      orders = await orderModel.find({ ticket });
      expect(orders.length).toBe(1);
      // expect(natsClient.emit).toBeCalledWith(Patterns.TicketCreated, body);
    });

    it.todo('should create an order and emit an event');
  });
});
