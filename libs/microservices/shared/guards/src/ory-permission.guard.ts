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

@Injectable()
export class OryPermissionGuard implements CanActivate {
  readonly logger = new Logger(OryPermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(OryPermissionsService)
    private readonly oryService: OryPermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { expression, relationTupleFactory } =
      getGuardingRelationTuple(this.reflector, context.getHandler()) ?? {};

    if (!relationTupleFactory) {
      // no relation tuple ? - should not use this guard then => Forbidden
      return Promise.resolve(false);
    }
    const relationTuple = relationTupleFactory(context);
    const result = await this.oryService.checkPermission(relationTuple);

    if (!result) {
      this.logger.warn(`Not allowed to access ${expression(context)}`);
      throw new ForbiddenException();
    }
    return true;
  }
}
