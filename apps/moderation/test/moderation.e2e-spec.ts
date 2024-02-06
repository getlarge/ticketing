/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { createMock } from '@golevelup/ts-jest';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AsyncLocalStorageModule } from '@ticketing/microservices/shared/async-local-storage';
import { loadEnv, validate } from '@ticketing/microservices/shared/env';
import { Model } from 'mongoose';

import { EnvironmentVariables } from '../src/app/env';
import { ModerationsModule } from '../src/app/moderation/moderations.module';
import { ModerationsTasks } from '../src/app/moderation/moderations.tasks';
import {
  Moderation as ModerationSchema,
  ModerationDocument,
} from '../src/app/moderation/schemas';

describe('ModerationsController (e2e)', () => {
  let app: NestFastifyApplication;
  let moderationModel: Model<ModerationDocument>;
  const envFilePath = 'apps/moderation/.env.test';
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
        ModerationsModule,
        MongooseModule.forRoot(envVariables['MONGODB_URI']),
        EventEmitterModule.forRoot({
          wildcard: true,
          delimiter: '/',
        }),
        AsyncLocalStorageModule.forRoot(),
      ],
    })
      .overrideProvider(ModerationsTasks)
      .useValue(createMock<ModerationsTasks>())
      .compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());

    moderationModel = app.get(getModelToken(ModerationSchema.name));

    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /moderations', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/moderations',
      });
      expect(response.statusCode).toBe(401);
    });
  });
});
