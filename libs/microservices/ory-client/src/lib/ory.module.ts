import { DynamicModule, Module, Provider, Type } from '@nestjs/common';

import {
  IOryModuleOptions,
  OryModuleAsyncOptions,
  OryModuleOptions,
  OryModuleOptionsFactory,
} from './ory.interfaces';
import { OryService } from './ory.service';
// import { OryPermissionsService } from './ory-permissions.service';

@Module({})
export class OryModule {
  static forRoot(
    options: IOryModuleOptions,
    isGlobal?: boolean,
  ): DynamicModule {
    return {
      module: OryModule,
      providers: [
        { provide: OryModuleOptions, useValue: options },
        OryService,
        // OryPermissionsService,
      ],
      exports: [
        OryModuleOptions,
        OryService,
        //  OryPermissionsService
      ],
      global: isGlobal,
    };
  }

  static forRootAsync(
    options: OryModuleAsyncOptions,
    isGlobal?: boolean,
  ): DynamicModule {
    return {
      module: OryModule,
      imports: options.imports ?? [],
      providers: [
        ...this.createAsyncProviders(options),
        OryService,
        // OryPermissionsService,
      ],
      exports: [
        OryModuleOptions,
        OryService,
        //  OryPermissionsService
      ],
      global: isGlobal,
    };
  }

  private static createAsyncProviders(
    options: OryModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    if (options.useClass) {
      return [
        this.createAsyncOptionsProvider(options),
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }
    throw new Error('Invalid OryModuleAsyncOptions');
  }

  private static createAsyncOptionsProvider(
    options: OryModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OryModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }
    if (!options.useExisting && !options.useClass) {
      throw new Error('Invalid OryModuleAsyncOptions');
    }
    return {
      provide: OryModuleOptions,
      useFactory: (optionsFactory: OryModuleOptionsFactory) =>
        optionsFactory.createOryOptions(),
      inject: [
        (options.useExisting ??
          options.useClass) as Type<OryModuleOptionsFactory>,
      ],
    };
  }
}
