import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { validate } from '@ticketing/microservices/shared/env';
import { HttpErrorFilter } from '@ticketing/microservices/shared/filters';

import { AppController } from '../src/app/app.controller';
import { AppService } from '../src/app/app.service';
import { EnvironmentVariables } from '../src/app/env';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          expandVariables: true,
          // envFilePath,
          validate: validate(EnvironmentVariables),
        }),
      ],
      providers: [
        AppService,
        {
          provide: APP_FILTER,
          useFactory: () => new HttpErrorFilter(),
        },
      ],
      controllers: [AppController],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    await app.init();
  });

  afterEach(() => app.close());

  it('/ (GET) - returns a 200', async () => {
    const { payload, statusCode } = await app.inject({
      method: 'GET',
      url: '/',
    });
    //
    const body = JSON.parse(payload);
    expect(statusCode).toBe(200);
    expect(body).toHaveProperty('message');
  });
});
