import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  NotFoundException,
  Type,
} from '@nestjs/common';
import { FeatureFlags } from '@ticketing/shared/constants';

import { FeatureFlagsService } from './feature-flags.service';

export function FeatureFlagsGuard(
  featureFlagName: FeatureFlags,
): Type<CanActivate> {
  @Injectable()
  class Guard implements CanActivate {
    constructor(private readonly featureFlagsService: FeatureFlagsService) {}

    canActivate(context: ExecutionContext): boolean {
      const isEnabled = this.featureFlagsService.isEnabled(featureFlagName);
      if (!isEnabled) {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        throw new NotFoundException(`Cannot ${request.method} ${request.url}`);
      }
      return true;
    }
  }

  return mixin(Guard);
}
