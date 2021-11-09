import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@ticketing/microservices/shared/fastify-passport';
import { SESSION_ACCESS_TOKEN } from '@ticketing/shared/constants';
import { FastifyRequest } from 'fastify';
import { Strategy, StrategyOptions } from 'passport-jwt';

import { AppConfigService } from '../env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(ConfigService) configService: AppConfigService) {
    super({
      jwtFromRequest: (req) => {
        const request = req as unknown as FastifyRequest;
        return request.session.get(SESSION_ACCESS_TOKEN);
      },
      ignoreExpiration: false,
      audience: '',
      issuer: `${configService.get('APP_NAME')}.${configService.get(
        'APP_VERSION'
      )}.${configService.get('NODE_ENV')}`,
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
  }): { id: string; email: string } {
    // TODO: has user been banned ?
    return { id: payload.sub, email: payload.username };
  }
}
