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
import fastifyPassport from 'fastify-passport';
import fastifySecureSession from 'fastify-secure-session';
import { Model, Types } from 'mongoose';

import { AppConfigService, EnvironmentVariables } from '../src/app/env';
import { CreateOrder, Order, OrderStatus } from '../src/app/orders/models';
import { OrdersModule } from '../src/app/orders/orders.module';
import { Order as OrderSchema, OrderDocument } from '../src/app/orders/schemas';
import { Ticket } from '../src/app/tickets/models';
import {
  Ticket as TicketSchema,
  TicketDocument,
} from '../src/app/tickets/schemas';
import { envFilePath } from './constants';

const defaultUserEmail = 'test@test.com';

describe('OrdersController (e2e)', () => {
  let app: NestFastifyApplication;
  let orderModel: Model<OrderDocument>;
  let ticketModel: Model<TicketDocument>;
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
    natsClient = app.get(Publisher);
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

    it('should return a 400 if the ticket is already reserved', async () => {
      const userId = new Types.ObjectId().toString('hex');

      const session = createSigninSession(app, {
        email: defaultUserEmail,
        id: userId,
      });
      const ticket = await ticketModel.create({ title: 'park', price: 1 });
      await orderModel.create({
        ticket,
        userId,
        status: OrderStatus.Created,
        expiresAt: new Date(),
      });
      const order: CreateOrder = { ticketId: ticket.toJSON<Ticket>().id };
      //
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        cookies: { session },
        payload: order,
      });
      expect(statusCode).toBe(400);
      expect(natsClient.emit).not.toBeCalled();
    });

    it('should create an order with valid ticket and emit a "created" event', async () => {
      const userId = new Types.ObjectId().toString('hex');
      const session = createSigninSession(app, {
        email: defaultUserEmail,
        id: userId,
      });
      const ticket = await ticketModel.create({ title: 'park', price: 1 });
      const ticketId = ticket.toJSON<Ticket>().id;
      const order: CreateOrder = { ticketId };
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
      const body: Order = JSON.parse(payload);
      expect(body.userId).toBe(userId);
      expect(body.status).toBe(OrderStatus.Created);
      expect(body).toHaveProperty('ticket');
      expect(body.ticket).toEqual(expect.objectContaining({ id: ticketId }));
      orders = await orderModel.find({ ticket });
      expect(orders.length).toBe(1);
      expect(natsClient.emit).toBeCalledWith(Patterns.OrderCreated, body);
    });
  });

  describe('/orders (GET)', () => {
    const url = '/orders';

    it(`should return only user's orders`, async () => {
      const userId = new Types.ObjectId().toString('hex');
      const session = createSigninSession(app, {
        email: defaultUserEmail,
        id: userId,
      });
      // create tickets
      const tickets = await Promise.all(
        [
          { title: 'title1', price: 1 },
          { title: 'title2', price: 1 },
          { title: 'title3', price: 1 },
        ].map((ticketToCreate) => ticketModel.create(ticketToCreate))
      );

      const userOrder = (
        await orderModel.create({
          ticket: tickets[0],
          userId,
          expiresAt: new Date(),
        })
      ).toJSON<Order>();
      await orderModel.create({
        ticket: tickets[1],
        userId: new Types.ObjectId().toString('hex'),
        expiresAt: new Date(),
      });
      //
      const { payload, statusCode } = await app.inject({
        method: 'GET',
        url,
        cookies: { session },
      });
      //
      expect(statusCode).toBe(200);
      const body = JSON.parse(payload);
      expect(body.length).toEqual(1);
      expect(body[0]?.id).toEqual(userOrder.id);
      expect(body[0]?.ticket?.id).toEqual(tickets[0]._id.toString());
    });
  });

  describe('/orders/:id (GET)', () => {
    const baseUrl = '/orders';

    it(`should return 401 when user is not authenticated `, async () => {
      const { statusCode } = await app.inject({
        method: 'GET',
        url: `${baseUrl}/${new Types.ObjectId().toHexString()}`,
      });
      //
      expect(statusCode).toBe(401);
    });

    it(`should return 404 when order does not exist`, async () => {
      const session = createSigninSession(app, {
        email: defaultUserEmail,
      });
      const { statusCode } = await app.inject({
        method: 'GET',
        url: `${baseUrl}/${new Types.ObjectId().toHexString()}`,
        cookies: { session },
      });
      //
      expect(statusCode).toBe(404);
    });

    it(`should return 403 when order does not belong to user`, async () => {
      const session = createSigninSession(app, {
        email: defaultUserEmail,
      });
      const ticket = await ticketModel.create({ title: 'title1', price: 1 });
      const order = (
        await orderModel.create({
          ticket,
          userId: new Types.ObjectId().toString('hex'),
          expiresAt: new Date(),
        })
      ).toJSON<Order>();
      const { statusCode } = await app.inject({
        method: 'GET',
        url: `${baseUrl}/${order.id}`,
        cookies: { session },
      });
      //
      expect(statusCode).toBe(403);
    });

    it(`should return order if it belongs to the current user`, async () => {
      const userId = new Types.ObjectId().toString('hex');
      const session = createSigninSession(app, {
        email: defaultUserEmail,
        id: userId,
      });
      const ticket = await ticketModel.create({ title: 'title1', price: 1 });
      const userOrder = (
        await orderModel.create({
          ticket,
          userId,
          expiresAt: new Date(),
        })
      ).toJSON<Order>();
      //
      const { payload, statusCode } = await app.inject({
        method: 'GET',
        url: `${baseUrl}/${userOrder.id}`,
        cookies: { session },
      });
      //
      expect(statusCode).toBe(200);
      const body: Order = JSON.parse(payload);
      expect(body?.id).toEqual(userOrder.id);
      expect(body?.ticket?.id).toEqual(ticket._id.toString());
    });
  });

  describe('/orders/:id (DELETE)', () => {
    const baseUrl = '/orders';

    it('should cancel an order and return 200 and emit a "cancelled" event', async () => {
      const userId = new Types.ObjectId().toString('hex');
      const session = createSigninSession(app, {
        email: defaultUserEmail,
        id: userId,
      });
      const ticket = await ticketModel.create({ title: 'park', price: 1 });
      const order = (
        await orderModel.create({
          ticket,
          userId,
          expiresAt: new Date(),
        })
      ).toJSON<Order>();
      //
      const { payload, statusCode } = await app.inject({
        method: 'DELETE',
        url: `${baseUrl}/${order.id}`,
        cookies: { session },
      });
      //
      expect(statusCode).toBe(200);
      const body: Order = JSON.parse(payload);
      expect(body.userId).toBe(userId);
      expect(body.status).toBe(OrderStatus.Cancelled);
      expect(body).toHaveProperty('ticket');
      expect(body.ticket).toEqual(
        expect.objectContaining({ id: ticket._id.toString() })
      );
      expect(natsClient.emit).toBeCalledWith(Patterns.OrderCancelled, body);
    });
  });
});
