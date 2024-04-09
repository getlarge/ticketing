import { OryOAuth2AuthenticationGuard as oryOAuth2AuthenticationGuard } from '@getlarge/hydra-client-wrapper';
import { CanActivate, Type } from '@nestjs/common';
import {
  CURRENT_CLIENT_KEY,
  CURRENT_USER_KEY,
} from '@ticketing/shared/constants';
import type { Client, User } from '@ticketing/shared/models';
import type { FastifyRequest } from 'fastify';

export const OryOAuth2AuthenticationGuard = (): Type<CanActivate> =>
  oryOAuth2AuthenticationGuard({
    accessTokenResolver: (ctx) =>
      ctx
        .switchToHttp()
        .getRequest<FastifyRequest>()
        .headers?.authorization?.replace('Bearer ', ''),
    postValidationHook(ctx, token) {
      ctx.switchToHttp().getRequest()[CURRENT_CLIENT_KEY] = {
        id: token.ext.clientId,
        clientId: token.client_id,
        userId: token.ext.userId,
      } satisfies Client;
      ctx.switchToHttp().getRequest()[CURRENT_USER_KEY] = {
        id: token.ext.userId,
        email: token.ext.userEmail,
        identityId: token.ext.userIdentityId,
      } satisfies User;
    },
  });
