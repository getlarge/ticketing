import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { Environment } from '@ticketing/shared/constants';
import { CookieSerializeOptions } from 'fastify-cookie';

import { devEnvironments } from './env';

export enum SecurityRequirements {
  Session = 'session',
  Bearer = 'bearer',
}

export const sessionSecurityScheme: SecuritySchemeObject = {
  type: 'apiKey',
  in: 'cookie',
  name: 'session',
};

export const bearerSecurityScheme: SecuritySchemeObject = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
};

export const getCookieOptions = (
  environment: Environment
): CookieSerializeOptions => ({
  secure: !devEnvironments.includes(environment),
  signed: false,
  path: '/',
  maxAge: 60 * 60,
});

export const GLOBAL_API_PREFIX = 'api';
