import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { OryAuthenticationService } from '@ticketing/microservices/ory-client';
import type { FastifyRequest } from 'fastify/types/request';

@Injectable()
export class OryAuthenticationGuard implements CanActivate {
  readonly logger = new Logger(OryAuthenticationGuard.name);

  constructor(
    @Inject(OryAuthenticationService)
    private readonly oryService: OryAuthenticationService,
  ) {}

  private getRequest(context: ExecutionContext): FastifyRequest {
    return context.switchToHttp().getRequest();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(context);
    const result = await this.oryService.validateSession(req);
    if (!result) {
      throw new UnauthorizedException();
    }
    return result;
  }
}
