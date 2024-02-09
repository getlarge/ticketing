import { Observable } from 'rxjs';

import { StorageFile } from '../../storage';

export type HandlerResponse<T extends StorageFile = StorageFile> = {
  body: Record<string, unknown>;
  remove: () => Observable<void>;
} & (
  | {
      file: T | undefined;
    }
  | {
      files: T[] | Record<string, T[]>;
    }
);
