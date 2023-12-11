import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { OryService } from '@ticketing/microservices/ory-client';
import type { FastifyRequest } from 'fastify/types/request';

@Injectable()
export class OryAuthGuard implements CanActivate {
  readonly logger = new Logger(OryAuthGuard.name);

  constructor(@Inject(OryService) private readonly oryService: OryService) {}

  private getRequest(context: ExecutionContext): FastifyRequest {
    return context.switchToHttp().getRequest();
  }

  canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(context);
    return this.oryService.validateSession(req);
  }
}
