import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OryPermissionsService } from '@ticketing/microservices/ory-client';
import { getGuardingRelationTuple } from '@ticketing/microservices/shared/decorators';
import { CURRENT_USER_KEY } from '@ticketing/shared/constants';
import type { FastifyRequest } from 'fastify/types/request';

@Injectable()
export class OryPermissionGuard implements CanActivate {
  readonly logger = new Logger(OryPermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(OryPermissionsService)
    private readonly oryService: OryPermissionsService,
  ) {}

  private getRequest(context: ExecutionContext): FastifyRequest {
    return context.switchToHttp().getRequest();
  }

  private getUserId(context: ExecutionContext): string | null {
    const request = this.getRequest(context);
    const currentUser = request[CURRENT_USER_KEY];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (currentUser as any)?.id ?? null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { expression, relationTuple, replacementsFactory } =
      getGuardingRelationTuple(this.reflector, context.getHandler()) ?? {};

    if (relationTuple == null) {
      // no relation tuple ? - should not use this guard then => Forbidden
      return Promise.resolve(false);
    }
    const currentUserId = this.getUserId(context);
    const replacements = {
      currentUserId,
      ...(replacementsFactory?.(context) ?? {}),
    };
    const result = await this.oryService.checkPermission(
      relationTuple,
      replacements,
    );

    if (!result) {
      this.logger.warn(
        `User ${currentUserId} is not allowed to access ${expression(context)}`,
      );
      throw new ForbiddenException();
    }
    return true;
  }
}
