/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { INestMicroservice } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomStrategy } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AmqpClient, AmqpServer } from '@s1seven/nestjs-tools-amqp-transport';
import { loadEnv, validate } from '@ticketing/microservices/shared/env';
import { Patterns } from '@ticketing/microservices/shared/events';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { Services } from '@ticketing/shared/constants';
import { Types } from 'mongoose';
import { delay, lastValueFrom } from 'rxjs';

import { AppConfigService, EnvironmentVariables } from '../src/app/env';
import { OrdersModule } from '../src/app/orders/orders.module';
import { TicketsService } from '../src/app/tickets/tickets.service';
import { envFilePath } from './constants';
import { mockOrderEvent } from './models/order.mock';

describe('OrdersMSController (e2e)', () => {
  let app: NestFastifyApplication;
  let microservice: INestMicroservice;
  let orderRmqPublisher: AmqpClient;
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
        OrdersModule,
        MongooseModule.forRoot(envVariables['MONGODB_URI']),
      ],
    })
      .overrideProvider(GlobalErrorFilter)
      .useValue(exceptionFilter)
      .compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    const configService = app.get<AppConfigService>(ConfigService);
    const rmqUrl = configService.get('RMQ_URL') as string;

    orderRmqPublisher = new AmqpClient({
      urls: [rmqUrl],
      persistent: false,
      noAck: false,
      prefetchCount: 1,
      isGlobalPrefetchCount: false,
      queue: `${Services.TICKETS_SERVICE}_QUEUE`,
      replyQueue: `${Services.TICKETS_SERVICE}_REPLY_${Services.TICKETS_SERVICE}_QUEUE`,
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
        queue: `${Services.ORDERS_SERVICE}_QUEUE`,
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
    await microservice.listen();
    await app.init();
  });

  afterAll(async () => {
    orderRmqPublisher.close();
    await microservice.close();
    await app.close();
  });

  describe('order:created', () => {
    it('should NOT set ticket orderId when event data is invalid', async () => {
      const order = {
        id: new Types.ObjectId().toHexString(),
        userId: '',
        status: 'invalid status',
        ticket: {
          id: new Types.ObjectId().toHexString(),
          title: 3000,
          price: 'not a price',
        },
      };
      const ticketsService = app.get(TicketsService);
      ticketsService.createOrder = jest.fn();
      //
      await lastValueFrom(
        orderRmqPublisher.emit(Patterns.OrderCreated, order).pipe(delay(250)),
      );
      expect(ticketsService.createOrder).not.toBeCalled();
      expect(exceptionFilter.catch).toBeCalled();
    }, 6000);

    it('should set ticket orderId when event data is valid', async () => {
      const order = mockOrderEvent();
      const ticketsService = app.get(TicketsService);
      ticketsService.createOrder = jest.fn();
      //
      await lastValueFrom(
        orderRmqPublisher.emit(Patterns.OrderCreated, order).pipe(delay(250)),
      );
      expect(ticketsService.createOrder).toBeCalled();
    }, 6000);
  });

  describe('order:cancelled', () => {
    it('should unset ticket orderId when event data is valid', async () => {
      const order = mockOrderEvent();
      const ticketsService = app.get(TicketsService);
      ticketsService.cancelOrder = jest.fn();
      //
      await lastValueFrom(
        orderRmqPublisher.emit(Patterns.OrderCancelled, order).pipe(delay(250)),
      );
      expect(ticketsService.cancelOrder).toBeCalled();
    }, 6000);
  });
});
