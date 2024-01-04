import { Inject, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

type Key = string | symbol | object;
export type StoreMap = Map<Key, unknown>;

const noOp = (): void => undefined;

@Injectable()
export class AsyncLocalStorageService {
  readonly instance: AsyncLocalStorage<StoreMap>;
  private static _instance: AsyncLocalStorage<StoreMap>;

  constructor(
    @Inject('ASYNC_LOCAL_STORAGE') instance: AsyncLocalStorage<StoreMap>,
  ) {
    // ensure that AsyncLocalStorage is a singleton
    AsyncLocalStorageService.instance ??= instance;
    this.instance = AsyncLocalStorageService.instance || instance;
  }

  static get instance(): AsyncLocalStorage<StoreMap> {
    return this._instance;
  }

  static set instance(value: AsyncLocalStorage<StoreMap>) {
    this._instance = value;
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

  get<k extends Key>(key: k): unknown {
    return this.safeStore.get(key);
  }

  set<k extends Key, T = unknown>(key: k, value: T): this {
    this.safeStore.set(key, value);
    return this;
  }
}
