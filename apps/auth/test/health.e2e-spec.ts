import { ConfigModule } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from '../src/app/app.controller';
import { AppService } from '../src/app/app.service';
import { HealthModule } from '../src/app/health/health.module';
import { envFilePath } from './constants';

describe('HealthController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          expandVariables: true,
          envFilePath,
        }),
        HealthModule,
      ],
      providers: [AppService],
      controllers: [AppController],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    await app.init();
  });

  it('/health (GET)', async () => {
    const { payload, statusCode } = await app.inject({
      method: 'GET',
      url: '/health',
    });
    //
    const body = JSON.parse(payload);
    expect(body).toHaveProperty('status');
    expect(statusCode).toBe(200);
  });
});
