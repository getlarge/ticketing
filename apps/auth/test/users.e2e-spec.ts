/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
/* eslint-disable sonarjs/no-duplicate-string */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { loadEnv, validate } from '@ticketing/microservices/shared/env';
import { HttpErrorFilter } from '@ticketing/microservices/shared/filters';
import { UserCredentials } from '@ticketing/shared/models';
import fastifyPassport from 'fastify-passport';
import fastifySecureSession from 'fastify-secure-session';

import { AppConfigService, EnvironmentVariables } from '../src/app/env';
import { UsersModule } from '../src/app/users/users.module';
import { envFilePath } from './constants';
import { signUpAndLogin } from './helpers';

describe('UsersController (e2e)', () => {
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
        UsersModule,
        MongooseModule.forRoot(envVariables['MONGODB_URI']),
      ],
      providers: [
        {
          provide: APP_FILTER,
          useClass: HttpErrorFilter,
        },
      ],
    }).compile();

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

  describe('/users/sign-up (POST)', () => {
    const url = '/users/sign-up';
    it('should return a 201 on successful sign-up', async () => {
      const credentials: UserCredentials = {
        email: 'test@test.com',
        password: 'P4s&wORD',
      };
      const { payload, statusCode } = await app.inject({
        method: 'POST',
        url,
        payload: credentials,
      });
      //
      const body = JSON.parse(payload);
      expect(statusCode).toBe(201);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('email');
    });

    it('should return a 400 when providing invalid email', async () => {
      const credentials: UserCredentials = {
        email: 'test',
        password: 'P4s&wORD',
      };
      const { payload, statusCode } = await app.inject({
        method: 'POST',
        url,
        payload: credentials,
      });
      //
      const body = JSON.parse(payload);
      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('errors');
      expect(body.errors[0].message).toBe('email must be valid');
    });

    it('should return a 400 when providing invalid password', async () => {
      const credentials: UserCredentials = {
        email: 'test@test.com',
        password: 'P4s',
      };
      const { payload, statusCode } = await app.inject({
        method: 'POST',
        url,
        payload: credentials,
      });
      //
      const body = JSON.parse(payload);
      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('errors');
      expect(body.errors[0].message).toBe(
        'password must be longer than or equal to 4 characters'
      );
    });

    it('should return a 400 when email is duplicate', async () => {
      const credentials: UserCredentials = {
        email: 'test@test.com',
        password: 'P4s&wORD',
      };
      await app
        .inject({
          method: 'POST',
          url,
          payload: credentials,
        })
        .then(({ statusCode }) => expect(statusCode).toBe(201));

      const response = await app.inject({
        method: 'POST',
        url,
        payload: credentials,
      });
      //
      const body = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(body).toHaveProperty('errors');
      expect(body.errors[0].message).toBe('email already used');
    });
  });

  describe('/users/sign-in (POST)', () => {
    const url = '/users/sign-in';

    it('should return a 200 on successful sign-in and set cookie', async () => {
      const credentials: UserCredentials = {
        email: 'test@test.it',
        password: 'pass',
      };
      await app
        .inject({
          method: 'POST',
          url: '/users/sign-up',
          payload: credentials,
        })
        .then(({ statusCode }) => expect(statusCode).toBe(201));
      //
      const response = await app.inject({
        method: 'POST',
        url,
        payload: credentials,
      });
      //
      const body = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(body).toHaveProperty('token');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.cookies[0]).toEqual(
        expect.objectContaining({
          name: 'session',
          value: expect.any(String),
        })
      );
    });

    it('should return a 401 when unknown credential are supplied', async () => {
      const credentials: UserCredentials = {
        email: 'unknown@test.com',
        password: 'pass',
      };
      //
      const response = await app.inject({
        method: 'POST',
        url,
        payload: credentials,
      });
      //
      const body = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(body).toHaveProperty('errors');
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('should return a 401 when invalid password is supplied', async () => {
      const email = 'unknown@test.it';
      await app
        .inject({
          method: 'POST',
          url: '/users/sign-up',
          payload: { email, password: 'pass' },
        })
        .then(({ statusCode }) => expect(statusCode).toBe(201));
      //
      const response = await app.inject({
        method: 'POST',
        url,
        payload: { email, password: 'PASS' },
      });
      //
      const body = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(body).toHaveProperty('errors');
    });
  });

  describe('/users/sign-out (POST)', () => {
    const url = '/users/sign-out';

    it('should return a 200 on successful sign-out and delete cookie', async () => {
      const credentials: UserCredentials = {
        email: 'test@test.it',
        password: 'P4s&wORD',
      };
      await app
        .inject({
          method: 'POST',
          url: '/users/sign-up',
          payload: credentials,
        })
        .then(({ statusCode }) => expect(statusCode).toBe(201));

      const signInResponse = await app.inject({
        method: 'POST',
        url: '/users/sign-in',
        payload: credentials,
      });
      expect(signInResponse.headers['set-cookie']).toBeDefined();
      const cookies = { session: (signInResponse.cookies[0] as any).value };
      //
      const response = await app.inject({
        method: 'POST',
        url,
        payload: credentials,
        cookies,
      });
      //
      const sessionCookie = response.cookies.find(
        (cookie) => (cookie as any).name === 'session'
      );
      expect(response.statusCode).toBe(200);
      expect((sessionCookie as any)?.value).toBe('');
    });
  });

  describe('/users/current-user (GET)', () => {
    const url = '/users/current-user';

    it('should return a 200 with current user when logged in', async () => {
      const credentials: UserCredentials = {
        email: 'test@test.it',
        password: 'P4s&wORD',
      };
      const cookies = await signUpAndLogin(app, credentials);
      //
      const response = await app.inject({
        method: 'GET',
        url,
        cookies,
      });
      //
      const body = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('email');
      expect(body.email).toBe(credentials.email);
      expect(body).not.toHaveProperty('password');
    });

    it('should return a 401 when NOT logged in', async () => {
      const response = await app.inject({
        method: 'GET',
        url,
      });
      //
      const body = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(body).toHaveProperty('errors');
    });
  });
});
