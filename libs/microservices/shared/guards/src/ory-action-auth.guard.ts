import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BaseEnvironmentVariables,
  OryActionEnvironmentVariables,
} from '@ticketing/microservices/shared/env';
import type { FastifyRequest } from 'fastify/types/request';

@Injectable()
export class OryActionAuthGuard implements CanActivate {
  readonly logger = new Logger(OryActionAuthGuard.name);
  private readonly apiKey: string;

  constructor(
    @Inject(ConfigService)
    configService: ConfigService<
      BaseEnvironmentVariables & OryActionEnvironmentVariables
    >
  ) {
    this.apiKey = configService.get('ORY_ACTION_API_KEY');
  }

  private getRequest(context: ExecutionContext): FastifyRequest {
    return context.switchToHttp().getRequest();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(context);
    const authHeader = req.headers['x-ory-api-key'];
    return authHeader && authHeader === this.apiKey;
  }
}
