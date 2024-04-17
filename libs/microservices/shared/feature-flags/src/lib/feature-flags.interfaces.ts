import type { InjectionToken, Type } from '@nestjs/common';
import type { FeatureFlags } from '@ticketing/shared/constants';

export interface FeatureFlagsModuleOptions {
  flags: FeatureFlags[];
}

export interface FeatureFlagsModuleOptionsFactory {
  createFeatureFlagsOptions():
    | Promise<FeatureFlagsModuleOptions>
    | FeatureFlagsModuleOptions;
}

export interface FeatureFlagsModuleAsyncOptions {
  imports?: Type<unknown>[];
  useFactory?: (
    ...args: unknown[]
  ) => Promise<FeatureFlagsModuleOptions> | FeatureFlagsModuleOptions;
  inject?: InjectionToken[];
}