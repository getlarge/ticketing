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
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import {
  createSigninSession,
  MockClient,
} from '@ticketing/microservices/shared/testing';
import { OrderStatus } from '@ticketing/shared/models';
import fastifyPassport from 'fastify-passport';
import fastifySecureSession from 'fastify-secure-session';
import { Model, Types } from 'mongoose';

import { AppConfigService, EnvironmentVariables } from '../src/app/env';
import { Order } from '../src/app/orders/models';
import { Order as OrderSchema, OrderDocument } from '../src/app/orders/schemas';
import { CreatePayment } from '../src/app/payments/models';
import { PaymentsModule } from '../src/app/payments/payments.module';
import {
  Payment as PaymentSchema,
  PaymentDocument,
} from '../src/app/payments/schemas';
import { StripeService } from '../src/app/payments/stripe.service';
import { envFilePath } from './constants';

const defaultUserEmail = 'test@test.com';

describe('PaymentsController (e2e)', () => {
  let app: NestFastifyApplication;
  let orderModel: Model<OrderDocument>;
  let paymentModel: Model<PaymentDocument>;
  let stripeService: StripeService;
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
        PaymentsModule,
        MongooseModule.forRoot(envVariables['MONGODB_URI']),
      ],
      providers: [
        {
          provide: APP_FILTER,
          useClass: GlobalErrorFilter,
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

    stripeService = app.get(StripeService);
    orderModel = app.get<Model<OrderDocument>>(getModelToken(OrderSchema.name));
    paymentModel = app.get<Model<PaymentDocument>>(
      getModelToken(PaymentSchema.name)
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // natsClient = app.get(Publisher);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/payments (POST)', () => {
    const url = '/payments';

    it('should have a "payments" endpoint for POST requests', async () => {
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        payload: {},
      });
      //
      expect(statusCode).toBeDefined();
      expect(statusCode).not.toBe(404);
    });

    it('should return 401 to unauthorized users', async () => {
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        payload: {},
      });
      //
      expect(statusCode).toBe(401);
    });

    it('should return a 404 when purchasing an order that does not exist', async () => {
      const userId = new Types.ObjectId().toHexString();
      const session = createSigninSession(app, {
        email: defaultUserEmail,
        id: userId,
      });
      const paymentRequest: CreatePayment = {
        orderId: new Types.ObjectId().toHexString(),
        token: '',
      };
      //
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        cookies: { session },
        payload: paymentRequest,
      });
      expect(statusCode).toBe(404);
    });

    it('should return 401 when order does not belong to the user', async () => {
      const userId = new Types.ObjectId().toHexString();
      const session = createSigninSession(app, {
        email: defaultUserEmail,
        id: new Types.ObjectId().toHexString(),
      });
      const order: Order = {
        id: new Types.ObjectId().toHexString(),
        userId,
        price: 10,
        status: OrderStatus.Created,
        version: 0,
      };
      await orderModel.create({ _id: order.id, ...order });
      const paymentRequest: CreatePayment = {
        orderId: order.id,
        token: 'fake token',
      };
      //
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        cookies: { session },
        payload: paymentRequest,
      });
      //
      expect(statusCode).toBe(401);
    });

    it('should return a 400 when purchasing a cancelled order', async () => {
      const userId = new Types.ObjectId().toHexString();
      const session = createSigninSession(app, {
        email: defaultUserEmail,
        id: userId,
      });
      const order: Order = {
        id: new Types.ObjectId().toHexString(),
        userId,
        price: 10,
        status: OrderStatus.Cancelled,
        version: 0,
      };
      await orderModel.create({ _id: order.id, ...order });
      const paymentRequest: CreatePayment = {
        orderId: order.id,
        token: 'fake token',
      };
      //
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        cookies: { session },
        payload: paymentRequest,
      });
      expect(statusCode).toBe(400);
    });

    it('should return a 201 when providing valid order', async () => {
      const userId = new Types.ObjectId().toHexString();
      const token = 'tok_visa';
      const price = Math.floor(Math.random() * 1000);
      const session = createSigninSession(app, {
        email: defaultUserEmail,
        id: userId,
      });
      const order: Order = {
        id: new Types.ObjectId().toHexString(),
        userId,
        price,
        status: OrderStatus.Created,
        version: 0,
      };
      await orderModel.create({ _id: order.id, ...order });
      const paymentRequest: CreatePayment = {
        orderId: order.id,
        token,
      };
      //
      const { statusCode } = await app.inject({
        method: 'POST',
        url,
        cookies: { session },
        payload: paymentRequest,
      });

      expect(statusCode).toBe(201);
      const { data: charges } = await stripeService.instance.charges.list({
        limit: 50,
      });
      const foundCharge = charges.find(({ amount }) => amount === price * 100);
      expect(foundCharge).toBeDefined();
      expect(foundCharge.currency).toBe('eur');
      const payment = await paymentModel.findOne({
        orderId: order.id,
        stripeId: foundCharge.id,
      });
      expect(payment).not.toBeNull();
    });
  });
});
