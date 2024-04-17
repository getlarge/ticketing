import { OryAuthorizationGuard as oryAuthorizationGuard } from '@getlarge/keto-client-wrapper';
import { CanActivate, Type } from '@nestjs/common';

export const OryAuthorizationGuard = (): Type<CanActivate> =>
  oryAuthorizationGuard({});
