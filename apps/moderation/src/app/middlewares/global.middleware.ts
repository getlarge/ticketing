import { Logger, NestMiddleware } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

export class GlobalMiddleware implements NestMiddleware {
  use(
    req: FastifyReply['raw'],
    res: FastifyRequest['raw'],
    next: () => void,
  ): void {
    Logger.log('Global middleware');
    next();
  }
}

export function globalMiddleware(
  req: FastifyReply['raw'],
  res: FastifyRequest['raw'],
  next: () => void,
): void {
  return new GlobalMiddleware().use(req, res, next);
}
