import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class ModuleMiddleware implements NestMiddleware {
  use(
    req: FastifyReply['raw'],
    res: FastifyRequest['raw'],
    next: () => void,
  ): void {
    Logger.log('Module middleware');
    next();
  }
}
