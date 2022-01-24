import 'fastify-secure-session';

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BaseEnvironmentVariables,
  JWTEnvironmentVariables,
} from '@ticketing/microservices/shared/env';
import { PassportStrategy } from '@ticketing/microservices/shared/fastify-passport';
import {
  AUTHORIZATION_HEADER_NAME,
  SESSION_ACCESS_TOKEN,
} from '@ticketing/shared/constants';
import { User } from '@ticketing/shared/models';
import type { FastifyRequest } from 'fastify';
import { Strategy, StrategyOptions } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(ConfigService)
    configService: ConfigService<
      BaseEnvironmentVariables & JWTEnvironmentVariables
    >
  ) {
    super({
      jwtFromRequest: (req) => {
        const request = req as unknown as FastifyRequest;
        const { headers, session } = request;
        if (session?.get(SESSION_ACCESS_TOKEN)) {
          return session.get(SESSION_ACCESS_TOKEN);
        } else if (headers[AUTHORIZATION_HEADER_NAME]) {
          const jwtHeader = headers[AUTHORIZATION_HEADER_NAME] as string;
          return jwtHeader?.replace(/bearer/gi, '').trim();
        }
        return null;
      },
      ignoreExpiration: false,
      audience: '',
      issuer: configService.get('JWT_ISSUER'),
      algorithms: [configService.get('JWT_ALGORITHM')],
      secretOrKey: configService.get('JWT_PUBLIC_KEY'),
    } as StrategyOptions);
  }

  validate(payload: {
    username: string;
    sub: string;
    iat: number;
    exp: number;
    aud: string;
    iss: string;
  }): User {
    // TODO: has user been banned ?
    return { id: payload.sub, email: payload.username };
  }
}
