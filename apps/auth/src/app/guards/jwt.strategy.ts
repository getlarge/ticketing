import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@ticketing/microservices/shared/fastify-passport';
import { Strategy, StrategyOptions } from 'passport-jwt';

import { AppConfigService } from '../env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(ConfigService) configService: AppConfigService) {
    super({
      jwtFromRequest: (req) => {
        if (!req || !req.cookies) return null;
        return req.cookies['access_token'];
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

  async validate(payload: any) {
    // TODO: has user been banned ?
    return { userId: payload.sub, username: payload.username };
  }
}
