import type { BusboyConfig } from '@fastify/busboy';

import {
  type Storage,
  type StorageFile,
  DiskStorage,
  MemoryStorage,
} from '../storage';
import { UploadFilterHandler } from './filter';

export type UploadOptions<
  S extends Storage extends Storage<infer U>
    ? Storage<U>
    : Storage<StorageFile>,
> = Partial<BusboyConfig> & {
  dest?: string;
  storage?: S;
  filter?: UploadFilterHandler;
};

export type TransformedUploadOptions<
  S extends Storage extends Storage<infer U>
    ? Storage<U>
    : Storage<StorageFile>,
> = UploadOptions<S> & {
  storage: S;
};

export const DEFAULT_UPLOAD_OPTIONS: TransformedUploadOptions<MemoryStorage> = {
  storage: new MemoryStorage(),
};

export function transformUploadOptions<S extends Storage>(
  opts?: UploadOptions<S>,
): TransformedUploadOptions<S> {
  if (!opts) {
    return DEFAULT_UPLOAD_OPTIONS as unknown as TransformedUploadOptions<S>;
  }

  if (opts.dest != null) {
    return {
      ...opts,
      storage: new DiskStorage({
        dest: opts.dest,
        ...(typeof opts.storage?.options === 'object'
          ? opts.storage?.options
          : {}),
      }),
    } as unknown as TransformedUploadOptions<S>;
  }

  return {
    ...DEFAULT_UPLOAD_OPTIONS,
    ...opts,
  } as unknown as TransformedUploadOptions<S>;
}
