import { DynamicModule, Module, Provider } from '@nestjs/common';

import { FEATURE_FLAGS_OPTONS } from './feature-flags.constants';
import type {
  FeatureFlagsModuleAsyncOptions,
  FeatureFlagsModuleOptions,
} from './feature-flags.interface';
import { FeatureFlagsService } from './feature-flags.service';

@Module({})
export class FeatureFlagsModule {
  static forRoot(options: FeatureFlagsModuleOptions): DynamicModule {
    return {
      module: FeatureFlagsModule,
      providers: [
        {
          provide: FEATURE_FLAGS_OPTONS,
          useValue: options,
        },
        FeatureFlagsService,
      ],
      exports: [FeatureFlagsService],
    };
  }

  static forRootAsync(options: FeatureFlagsModuleAsyncOptions): DynamicModule {
    return {
      module: FeatureFlagsModule,
      imports: options.imports ?? [],
      providers: [
        this.createAsyncOptionsProvider(options),
        FeatureFlagsService,
      ],
      exports: [FeatureFlagsService],
    };
  }

  private static createAsyncOptionsProvider(
    options: FeatureFlagsModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: FEATURE_FLAGS_OPTONS,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }
    throw new Error(
      'Invalid FeatureFlagsModuleAsyncOptions. Must provide useFactory',
    );
  }
}
