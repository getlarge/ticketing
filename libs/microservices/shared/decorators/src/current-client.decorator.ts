import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CURRENT_CLIENT_KEY } from '@ticketing/shared/constants';
import { FastifyRequest } from 'fastify';

export const CurrentClient = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    return request[CURRENT_CLIENT_KEY];
  },
);
