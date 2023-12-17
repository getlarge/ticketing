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
import { getGuardingRelationTuples } from '@ticketing/microservices/shared/decorators';

@Injectable()
export class OryPermissionGuard implements CanActivate {
  readonly logger = new Logger(OryPermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(OryPermissionsService)
    private readonly oryService: OryPermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const factories =
      getGuardingRelationTuples(this.reflector, context.getHandler()) ?? [];

    if (!factories?.length) {
      // no relation tuple ? - should not use this guard then => Forbidden
      return Promise.resolve(false);
    }
    for (const { expression, relationTupleFactory } of factories) {
      const relationTuple = relationTupleFactory(context);
      const isPermitted = await this.oryService.checkPermission(relationTuple);
      if (!isPermitted) {
        this.logger.warn(`Not allowed to access ${expression(context)}`);
        throw new ForbiddenException();
      }
    }

    return true;
  }
}
