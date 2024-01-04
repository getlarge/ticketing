import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorageService } from '@ticketing/microservices/shared/async-local-storage';
import type { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(
    private readonly asyncLocalStorageService: AsyncLocalStorageService,
  ) {}

  use(
    req: FastifyRequest['raw'],
    res: FastifyReply['raw'],
    next: () => void,
  ): void {
    this.asyncLocalStorageService.enterWith(new Map());
    this.asyncLocalStorageService.set('REQUEST_CONTEXT', {
      requestId: req.headers['x-request-id'] ?? req['id'],
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] ?? req.socket.remoteAddress,
      user: req['user'],
    });
    next();
  }
}
