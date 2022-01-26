import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { Environment } from '@ticketing/shared/constants';
import { CookieSerializeOptions } from 'fastify-cookie';

import { devEnvironments } from './env';

export const GLOBAL_API_PREFIX = 'api';

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

export const ALLOWED_HEADERS = [
  'X-Version',
  'X-Access-Token',
  'Refresh',
  'Set-Cookie',
  'DNT',
  'User-Agent',
  'X-Requested-With',
  'If-Modified-Since',
  'Cache-Control',
  'Content-Type',
  'Range',
  'X-Scheme',
  'X-Real-IP',
  'X-Forwarded-Host',
  'X-Forwarded-For',
];

export const EXPOSED_HEADERS = [
  'Set-Cookie',
  'Content-Length',
  'Content-Range',
];
