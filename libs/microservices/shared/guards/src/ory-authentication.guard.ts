import { OryAuthenticationGuard as oryAuthenticationGuard } from '@getlarge/kratos-client-wrapper';
import { CanActivate, Type } from '@nestjs/common';
import { CURRENT_USER_KEY } from '@ticketing/shared/constants';
import type { FastifyRequest } from 'fastify';

export const OryAuthenticationGuard = (): Type<CanActivate> =>
  oryAuthenticationGuard({
    cookieResolver: (ctx) =>
      ctx.switchToHttp().getRequest<FastifyRequest>().headers.cookie,
    isValidSession: (x) => {
      return (
        !!x?.identity &&
        typeof x.identity.traits === 'object' &&
        !!x.identity.traits &&
        'email' in x.identity.traits &&
        typeof x.identity.metadata_public === 'object' &&
        !!x.identity.metadata_public &&
        'id' in x.identity.metadata_public &&
        typeof x.identity.metadata_public.id === 'string'
      );
    },
    sessionTokenResolver: (ctx) =>
      ctx
        .switchToHttp()
        .getRequest<FastifyRequest>()
        .headers?.authorization?.replace('Bearer ', ''),
    postValidationHook: (ctx, session) => {
      ctx.switchToHttp().getRequest().session = session;
      ctx.switchToHttp().getRequest()[CURRENT_USER_KEY] = {
        id: session.identity.metadata_public['id'],
        email: session.identity.traits.email,
        identityId: session.identity.id,
      };
    },
  });
