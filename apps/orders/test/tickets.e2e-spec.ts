/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { Publisher } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { loadEnv, validate } from '@ticketing/microservices/shared/env';
import { HttpErrorFilter } from '@ticketing/microservices/shared/filters';
import { MockClient } from '@ticketing/microservices/shared/testing';
import fastifyPassport from 'fastify-passport';
import fastifySecureSession from 'fastify-secure-session';
import { Types } from 'mongoose';

import { AppConfigService, EnvironmentVariables } from '../src/app/env';
import { TicketsModule } from '../src/app/tickets/tickets.module';
import { envFilePath } from './constants';

describe('TicketsController (e2e)', () => {
  let app: NestFastifyApplication;
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

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('ticket:created', () => {
    // tmock icket events coming from tickets-service
    it.skip('should invalidate input ticket ', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const ticket = {
        id: new Types.ObjectId().toHexString(),
        title: 3000,
        price: 'not a price',
        version: 'invalid version',
      };
    });
  });
});
