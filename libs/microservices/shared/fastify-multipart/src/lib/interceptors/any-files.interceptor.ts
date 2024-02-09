import {
  CallHandler,
  ExecutionContext,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { handleMultipartAnyFiles } from '../multipart/handlers/any-files';
import {
  type TransformedUploadOptions,
  type UploadOptions,
  transformUploadOptions,
} from '../multipart/options';
import { getMultipartRequest } from '../multipart/request';
import type { Storage } from '../storage';

export function AnyFilesInterceptor<S extends Storage>(
  options?: UploadOptions<S>,
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    private readonly options: TransformedUploadOptions<S>;

    constructor() {
      this.options = transformUploadOptions<S>(options);
    }

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<void>> {
      const ctx = context.switchToHttp();
      const req = getMultipartRequest(ctx);

      const { body, files, remove } = await handleMultipartAnyFiles<S>(
        req,
        this.options,
      );

      req.body = body;
      req.storageFiles = files;

      return next.handle().pipe(tap(remove));
    }
  }

  return mixin(MixinInterceptor);
}
