import { Inject, Injectable } from '@nestjs/common';
import { FEATURE_FLAGS } from '@ticketing/shared/constants';

import { FEATURE_FLAGS_OPTONS } from './feature-flags.constants';
import type { FeatureFlagsModuleOptions } from './feature-flags.interface';

@Injectable()
export class FeatureFlagsService {
  constructor(
    @Inject(FEATURE_FLAGS_OPTONS)
    private featureFlagsOptions: FeatureFlagsModuleOptions,
  ) {}

  getAll(): FEATURE_FLAGS[] {
    return this.featureFlagsOptions.flags;
  }

  getByName(name: string): string | undefined {
    return this.getAll().find((flag) => flag === name);
  }

  isEnabled(name: string): boolean {
    return !!this.getByName(name);
  }
}
