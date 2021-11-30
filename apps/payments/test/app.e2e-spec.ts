import { ConfigModule } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { validate } from '@ticketing/microservices/shared/env';

import { AppController } from '../src/app/app.controller';
import { AppService } from '../src/app/app.service';
import { EnvironmentVariables } from '../src/app/env';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          expandVariables: true,
          // envFilePath,
          validate: validate(EnvironmentVariables),
        }),
      ],
      providers: [AppService],
      controllers: [AppController],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    await app.init();
  });

  afterAll(() => app.close());

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
