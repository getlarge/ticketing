import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';

import {
  ContentGuardModuleAsyncOptions,
  ContentGuardModuleOptions,
  ContentGuardModuleOptionsFactory,
  IContentGuardModuleOptions,
} from './content-guard.interfaces';
import { ContentGuardService } from './content-guard.service';

@Module({})
export class ContentGuardModule {
  static forRoot(
    options: IContentGuardModuleOptions,
    isGlobal?: boolean,
  ): DynamicModule {
    return {
      module: ContentGuardModule,
      imports: [HttpModule],
      providers: [
        { provide: ContentGuardModuleOptions, useValue: options },
        ContentGuardService,
      ],
      exports: [ContentGuardModuleOptions, ContentGuardService],
      global: isGlobal,
    };
  }

  static forRootAsync(
    options: ContentGuardModuleAsyncOptions,
    isGlobal?: boolean,
  ): DynamicModule {
    return {
      module: ContentGuardModule,
      imports: options.imports
        ? [...options.imports, HttpModule]
        : [HttpModule],
      providers: [...this.createAsyncProviders(options), ContentGuardService],
      exports: [ContentGuardModuleOptions, ContentGuardService],
      global: isGlobal,
    };
  }

  private static createAsyncProviders(
    options: ContentGuardModuleAsyncOptions,
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
    throw new Error('Invalid ContentGuardModuleAsyncOptions');
  }

  private static createAsyncOptionsProvider(
    options: ContentGuardModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: ContentGuardModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }
    if (!options.useExisting && !options.useClass) {
      throw new Error('Invalid OryAuthenticationModuleAsyncOptions');
    }
    return {
      provide: ContentGuardModuleOptions,
      useFactory: (optionsFactory: ContentGuardModuleOptionsFactory) =>
        optionsFactory.createOryOptions(),
      inject: [
        (options.useExisting ??
          options.useClass) as Type<ContentGuardModuleOptionsFactory>,
      ],
    };
  }
}
