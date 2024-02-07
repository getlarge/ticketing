/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { OryRelationshipsService } from '@getlarge/keto-client-wrapper';
import {
  createRelationQuery,
  relationTupleBuilder,
} from '@getlarge/keto-relations-parser';
import {
  OryFrontendService,
  OryIdentitiesModule,
  OryIdentitiesService,
} from '@getlarge/kratos-client-wrapper';
import { createMock } from '@golevelup/ts-jest';
import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { Identity } from '@ory/client';
import { AsyncLocalStorageModule } from '@ticketing/microservices/shared/async-local-storage';
import { loadEnv, validate } from '@ticketing/microservices/shared/env';
import { PermissionNamespaces } from '@ticketing/microservices/shared/models';
import { Resources } from '@ticketing/shared/constants';
import { Moderation, ModerationStatus } from '@ticketing/shared/models';
import { randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';

import { EnvironmentVariables } from '../src/app/env';
import { ModerationsModule } from '../src/app/moderation/moderations.module';
import { ModerationsTasks } from '../src/app/moderation/moderations.tasks';
import {
  Moderation as ModerationSchema,
  ModerationDocument,
} from '../src/app/moderation/schemas';

class DummyScheduleModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: DummyScheduleModule,
      providers: [],
      exports: [],
    };
  }
}

const login = async (
  {
    oryFrontendService,
  }: {
    oryFrontendService: OryFrontendService;
  },
  { email, password }: { email: string; password: string },
): Promise<string> => {
  const { data: loginFlow } = await oryFrontendService.createNativeLoginFlow();

  const { data } = await oryFrontendService.updateLoginFlow({
    flow: loginFlow.id,
    updateLoginFlowBody: {
      password,
      identifier: email,
      method: 'password',
    },
  });
  return data.session_token as string;
};

const createOryUser = async (
  {
    oryFrontendService,
    oryIdentityService,
  }: {
    oryFrontendService: OryFrontendService;
    oryIdentityService: OryIdentitiesService;
  },
  {
    email,
    password,
    userId,
  }: { email: string; password: string; userId: string },
): Promise<{ identity: Identity; sessionToken: string }> => {
  const { data: registrationFlow } =
    await oryFrontendService.createNativeRegistrationFlow();

  const { data } = await oryFrontendService.updateRegistrationFlow({
    flow: registrationFlow.id,
    updateRegistrationFlowBody: {
      traits: { email },
      password,
      method: 'password',
    },
  });
  const { identity } = data;
  await oryIdentityService.updateIdentity({
    id: identity.id,
    updateIdentityBody: {
      metadata_public: { id: userId },
      schema_id: identity.schema_id,
      traits: identity.traits,
      state: identity.state,
    },
  });
  const sessionToken = await login({ oryFrontendService }, { email, password });
  return { identity, sessionToken };
};

const createOryAdminRelation = async (
  {
    oryRelationshipsService,
  }: {
    oryRelationshipsService: OryRelationshipsService;
  },
  { userId }: { userId: string },
): Promise<void> => {
  const relationTuple = relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.USERS], userId)
    .isIn('members')
    .of(PermissionNamespaces[Resources.GROUPS], 'admin')
    .toJSON();
  await oryRelationshipsService.createRelationship({
    createRelationshipBody: createRelationQuery(relationTuple).unwrapOrThrow(),
  });
};

const createOryModerationRelation = async (
  {
    oryRelationshipsService,
  }: {
    oryRelationshipsService: OryRelationshipsService;
  },
  { moderationId }: { moderationId: string },
): Promise<void> => {
  const relationTuple = relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.GROUPS], 'admin', 'members')
    .isIn('editors')
    .of(PermissionNamespaces[Resources.MODERATIONS], moderationId);
  await oryRelationshipsService.createRelationship({
    createRelationshipBody: createRelationQuery(relationTuple).unwrapOrThrow(),
  });
};

const createModeration = async ({
  moderationModel,
  oryRelationshipsService,
}: {
  moderationModel: Model<ModerationDocument>;
  oryRelationshipsService: OryRelationshipsService;
}): Promise<Moderation> => {
  const doc = await moderationModel.create({
    ticket: new Types.ObjectId(),
    status: ModerationStatus.Pending,
  });
  const moderation = doc.toJSON<Moderation>();
  await createOryModerationRelation(
    { oryRelationshipsService },
    { moderationId: moderation.id },
  );
  return moderation;
};

describe('ModerationsController (e2e)', () => {
  let app: NestFastifyApplication;
  const envFilePath = 'apps/moderation/.env.test';
  const envVariables = loadEnv(envFilePath, true);
  let oryFrontendService: OryFrontendService;
  let oryIdentityService: OryIdentitiesService;
  let oryRelationshipsService: OryRelationshipsService;
  let moderationModel: Model<ModerationDocument>;

  const validUserId = new Types.ObjectId().toHexString();
  const invalidUserId = new Types.ObjectId().toHexString();
  let validUserCredentials: { identity: Identity; sessionToken: string };
  let invalidUserCredentials: { identity: Identity; sessionToken: string };
  let exampleModeration: Moderation;

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
        OryIdentitiesModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (
            configService: ConfigService<EnvironmentVariables, true>,
          ) => ({
            basePath: configService.get('ORY_KRATOS_ADMIN_URL'),
            accessToken: configService.get('ORY_KRATOS_API_KEY'),
          }),
        }),
      ],
    })
      .overrideModule(ScheduleModule)
      .useModule(DummyScheduleModule)
      .overrideProvider(ModerationsTasks)
      .useValue(createMock<ModerationsTasks>())
      .compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());

    moderationModel = app.get(getModelToken(ModerationSchema.name));
    oryFrontendService = app.get(OryFrontendService);
    oryIdentityService = app.get(OryIdentitiesService);
    oryRelationshipsService = app.get(OryRelationshipsService);

    validUserCredentials = await createOryUser(
      { oryFrontendService, oryIdentityService },
      {
        email: `${randomBytes(8).toString('hex')}@example.com`,
        password: randomBytes(8).toString('hex'),
        userId: validUserId,
      },
    );
    await createOryAdminRelation(
      { oryRelationshipsService },
      { userId: validUserId },
    );

    invalidUserCredentials = await createOryUser(
      { oryFrontendService, oryIdentityService },
      {
        email: `${randomBytes(8).toString('hex')}@example.com`,
        password: randomBytes(8).toString('hex'),
        userId: invalidUserId,
      },
    );

    exampleModeration = await createModeration({
      moderationModel,
      oryRelationshipsService,
    });
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    validUserCredentials?.identity.id &&
      (await oryIdentityService?.deleteIdentity({
        id: validUserCredentials?.identity.id,
      }));
    invalidUserCredentials?.identity.id &&
      (await oryIdentityService?.deleteIdentity({
        id: invalidUserCredentials?.identity.id,
      }));
  });

  describe('GET /moderations', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/moderations',
      });
      expect(response.statusCode).toBe(401);
    });

    it('should return 403 when not authorized', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/moderations',
        headers: {
          Authorization: `Bearer ${invalidUserCredentials.sessionToken}`,
        },
      });
      expect(response.statusCode).toBe(403);
    });

    it('should return 200 when authorized', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/moderations',
        headers: {
          Authorization: `Bearer ${validUserCredentials.sessionToken}`,
        },
      });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /moderations/:id', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/moderations/${exampleModeration.id}`,
      });
      expect(response.statusCode).toBe(401);
    });

    it('should return 403 when not authorized', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/moderations/${exampleModeration.id}`,
        headers: {
          Authorization: `Bearer ${invalidUserCredentials.sessionToken}`,
        },
      });
      expect(response.statusCode).toBe(403);
    });

    it('should return 200 when authorized', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/moderations/${exampleModeration.id}`,
        headers: {
          Authorization: `Bearer ${validUserCredentials.sessionToken}`,
        },
      });
      expect(response.statusCode).toBe(200);
    });
  });
});
