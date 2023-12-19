import { DynamicModule, Module, Provider, Type } from '@nestjs/common';

import {
  IOryAuthenticationModuleOptions,
  OryAuthenticationModuleAsyncOptions,
  OryAuthenticationModuleOptions,
  OryAuthenticationModuleOptionsFactory,
} from './ory.interfaces';
import { OryAuthenticationService } from './ory-authentication.service';

@Module({})
export class OryAuthenticationModule {
  static forRoot(
    options: IOryAuthenticationModuleOptions,
    isGlobal?: boolean,
  ): DynamicModule {
    return {
      module: OryAuthenticationModule,
      providers: [
        { provide: OryAuthenticationModuleOptions, useValue: options },
        OryAuthenticationService,
      ],
      exports: [OryAuthenticationModuleOptions, OryAuthenticationService],
      global: isGlobal,
    };
  }

  static forRootAsync(
    options: OryAuthenticationModuleAsyncOptions,
    isGlobal?: boolean,
  ): DynamicModule {
    return {
      module: OryAuthenticationModule,
      imports: options.imports ?? [],
      providers: [
        ...this.createAsyncProviders(options),
        OryAuthenticationService,
      ],
      exports: [OryAuthenticationModuleOptions, OryAuthenticationService],
      global: isGlobal,
    };
  }

  private static createAsyncProviders(
    options: OryAuthenticationModuleAsyncOptions,
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
    throw new Error('Invalid OryAuthenticationModuleAsyncOptions');
  }

  private static createAsyncOptionsProvider(
    options: OryAuthenticationModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OryAuthenticationModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }
    if (!options.useExisting && !options.useClass) {
      throw new Error('Invalid OryAuthenticationModuleAsyncOptions');
    }
    return {
      provide: OryAuthenticationModuleOptions,
      useFactory: (optionsFactory: OryAuthenticationModuleOptionsFactory) =>
        optionsFactory.createOryOptions(),
      inject: [
        (options.useExisting ??
          options.useClass) as Type<OryAuthenticationModuleOptionsFactory>,
      ],
    };
  }
}
