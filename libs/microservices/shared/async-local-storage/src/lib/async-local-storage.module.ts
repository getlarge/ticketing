import { DynamicModule, Module, Provider } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

import {
  AsyncLocalStorageService,
  StoreMap,
} from './async-local-storage.service';

@Module({})
export class AsyncLocalStorageModule {
  public static forRoot(): DynamicModule {
    const providers: Provider[] = [
      {
        provide: 'ASYNC_LOCAL_STORAGE',
        useValue: new AsyncLocalStorage<StoreMap>(),
      },
      {
        provide: AsyncLocalStorageService,
        inject: ['ASYNC_LOCAL_STORAGE'],
        useFactory(store: AsyncLocalStorage<StoreMap>) {
          return new AsyncLocalStorageService(store);
        },
      },
    ];
    return {
      global: true,
      module: AsyncLocalStorageModule,
      providers,
      exports: providers,
    };
  }
}
