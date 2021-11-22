import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

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
