import { Inject, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

type Key = string | symbol | object;
export type StoreMap = Map<Key, unknown>;

const noOp = (): void => undefined;

@Injectable()
export class AsyncLocalStorageService {
  readonly instance: AsyncLocalStorage<StoreMap>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private static _instance: AsyncLocalStorage<StoreMap>;

  constructor(
    @Inject('ASYNC_LOCAL_STORAGE') instance: AsyncLocalStorage<StoreMap>,
  ) {
    // ensure that AsyncLocalStorage is a singleton
    AsyncLocalStorageService._instance ??= instance;
    this.instance = AsyncLocalStorageService.instance || instance;
  }

  static get instance(): AsyncLocalStorage<StoreMap> {
    if (!this._instance) {
      throw new Error(
        'AsyncLocalStorageService is not initialized. Call AsyncLocalStorageService.forRoot() first.',
      );
    }
    return this._instance;
  }

  static get store(): StoreMap | undefined {
    return this.instance?.getStore();
  }

  static enterWith(value: StoreMap = new Map()): void {
    this.instance?.enterWith(value);
  }

  static enter(): void {
    this.enterWith();
  }

  static exit(cb: () => void = noOp): void {
    this.instance?.exit(cb);
  }

  private static isStoreInitialized(x: unknown): x is StoreMap {
    return !!x;
  }

  // AsyncLocalStorage methods and properties
  run<R, TArgs extends unknown[]>(
    store: StoreMap,
    callback: (...args: TArgs) => R,
    ...args: TArgs
  ): R {
    return this.instance.run(store, callback, ...args);
  }

  enterWith(value: StoreMap = new Map()): void {
    this.instance.enterWith(value);
  }

  enter(): void {
    this.enterWith();
  }

  exit(cb: () => void = noOp): void {
    this.instance.exit(cb);
  }

  get store(): StoreMap | undefined {
    return this.instance.getStore();
  }

  private get safeStore(): StoreMap {
    if (AsyncLocalStorageService.isStoreInitialized(this.store)) {
      return this.store;
    }
    throw new Error(
      "Store is not initialized. Call 'enterWith' or 'run' first.",
    );
  }

  get<K extends Key>(key: K): unknown {
    return this.safeStore.get(key);
  }

  set<K extends Key, T = unknown>(key: K, value: T): this {
    this.safeStore.set(key, value);
    return this;
  }
}
