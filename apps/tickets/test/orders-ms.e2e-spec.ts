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
import {
  Listener,
  Publisher,
} from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { loadEnv, validate } from '@ticketing/microservices/shared/env';
import { Patterns } from '@ticketing/microservices/shared/events';
import { NatsStreamErrorFilter } from '@ticketing/microservices/shared/filters';
import { Resources, Services } from '@ticketing/shared/constants';
import { Types } from 'mongoose';
import { delay } from 'rxjs';

import { AppConfigService, EnvironmentVariables } from '../src/app/env';
import { OrdersModule } from '../src/app/orders/orders.module';
import { TicketsService } from '../src/app/tickets/tickets.service';
import { envFilePath } from './constants';
import { mockOrderEvent } from './models/order.mock';

describe('OrdersMSController (e2e)', () => {
  let app: NestFastifyApplication;
  let microservice: INestMicroservice;
  let natsPublisher: Publisher;
  // let ticketModel: Model<TicketDocument>;
  const envVariables = loadEnv(envFilePath, true);
  const expectionFilter = new NatsStreamErrorFilter();

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
      .overrideProvider(NatsStreamErrorFilter)
      .useValue(expectionFilter)
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
          durableName: `${Resources.ORDERS}_subscriptions_test`,
          manualAckMode: false,
          // deliverAllAvailable: true,
          // ackWait: 5 * 1000,
        }
      ),
    };
    microservice = moduleFixture.createNestMicroservice(options);
    // ticketModel = app.get<Model<TicketDocument>>(getModelToken(Ticket.name));
    await microservice.listen();
    await app.init();
  });

  afterAll(async () => {
    natsPublisher.close();
    await microservice.close();
    await app.close();
  });

  describe('order:created', () => {
    it('should NOT set ticket orderId when event data is invalid', (done) => {
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
      expectionFilter.catch = jest.fn();
      //
      natsPublisher
        .emit(Patterns.OrderCreated, order)
        .pipe(delay(250))
        .subscribe(() => {
          expect(ticketsService.createOrder).not.toBeCalled();
          expect(expectionFilter.catch).toBeCalled();
          done();
        });
    }, 6000);

    it('should set ticket orderId when event data is valid', (done) => {
      const order = mockOrderEvent();
      //
      const ticketsService = app.get(TicketsService);
      ticketsService.createOrder = jest.fn();
      natsPublisher
        .emit(Patterns.OrderCreated, order)
        .pipe(delay(250))
        .subscribe(() => {
          expect(ticketsService.createOrder).toBeCalled();
          // const createdTicket = await ticketModel.findOne({ _id: ticket.id });
          // expect(createdTicket._id.toString()).toEqual(ticket.id);
          done();
        });
    }, 6000);
  });

  describe('order:cancelled', () => {
    it('should unset ticket orderId when event data is valid', (done) => {
      const order = mockOrderEvent();
      //
      const ticketsService = app.get(TicketsService);
      ticketsService.createOrder = jest.fn();
      natsPublisher
        .emit(Patterns.OrderCancelled, order)
        .pipe(delay(250))
        .subscribe(() => {
          expect(ticketsService.cancelOrder).toBeCalled();
          done();
        });
    }, 6000);
  });
});
