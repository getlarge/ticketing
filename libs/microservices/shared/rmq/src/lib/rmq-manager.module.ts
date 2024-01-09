import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';

import { RmqManagerAsyncOptions, RmqManagerOptions } from './rmq.interfaces';
import { RmqManagerService } from './rmq-manager.service';

const DEFAULT_API_URL = 'http://localhost:15672/api';

@Module({})
export class RmqManagerModule {
  static forRoot(
    options: RmqManagerOptions = {
      apiUrl: DEFAULT_API_URL,
    },
  ): DynamicModule {
    const providers = [
      {
        provide: 'RMQ_MANAGER_OPTIONS',
        useValue: options,
      },
      RmqManagerService,
    ];

    return {
      module: RmqManagerModule,
      imports: [
        HttpModule.register({
          baseURL: options.apiUrl,
          ...(options.password &&
            options.username && {
              auth: { username: options.username, password: options.password },
            }),
          headers: { 'content-type': 'application/json' },
          timeout: 5000,
          timeoutErrorMessage: 'Request to RMQ manager timed out',
        }),
      ],
      providers,
      exports: providers,
    };
  }

  static forRootAsync(asyncOptions: RmqManagerAsyncOptions): DynamicModule {
    const providers = [
      {
        provide: 'RMQ_MANAGER_OPTIONS',
        useFactory: asyncOptions.useFactory,
        inject: asyncOptions.inject ?? [],
      },
      RmqManagerService,
    ];
    return {
      module: RmqManagerModule,
      imports: [
        HttpModule.registerAsync({
          inject: ['RMQ_MANAGER_OPTIONS'],
          useFactory: (
            options: RmqManagerOptions = {
              apiUrl: DEFAULT_API_URL,
            },
          ) => {
            return {
              baseURL: options.apiUrl,
              ...(options.password &&
                options.username && {
                  auth: {
                    username: options.username,
                    password: options.password,
                  },
                }),
              headers: { 'content-type': 'application/json' },
              timeout: 5000,
              timeoutErrorMessage: 'Request to RMQ manager timed out',
            };
          },
        }),
      ],
      providers,
      exports: providers,
    };
  }
}