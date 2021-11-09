import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { loadEnv, validate } from '@ticketing/microservices/shared/env';
import { HttpErrorFilter } from '@ticketing/microservices/shared/filters';

import { EnvironmentVariables } from '../src/app/env';
import { UsersModule } from '../src/app/users/users.module';
import { envFilePath } from './constants';

describe('UsersController (e2e)', () => {
  let app: NestFastifyApplication;

  const envVariables = loadEnv(envFilePath, true);
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          expandVariables: true,
          envFilePath,
          validate: validate(EnvironmentVariables),
          load: [() => envVariables],
        }),
        UsersModule,
        MongooseModule.forRoot(envVariables['MONGODB_URI']),
      ],
      providers: [
        {
          provide: APP_FILTER,
          useFactory: () => new HttpErrorFilter(),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    await app.init();
  });

  afterAll(() => app.close());

  it('/users/sign-up (POST) - returns a 201 on successful sign-up', async () => {
    const { payload, statusCode } = await app.inject({
      method: 'POST',
      url: '/users/sign-up',
      payload: { email: 'test@test.com', password: 'P4s&wORD' },
    });
    //
    const body = JSON.parse(payload);
    expect(statusCode).toBe(201);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
  });
});
