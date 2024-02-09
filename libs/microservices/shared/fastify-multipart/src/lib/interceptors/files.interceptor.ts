import {
  CallHandler,
  ExecutionContext,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { handleMultipartMultipleFiles } from '../multipart/handlers/multiple-files';
import {
  type TransformedUploadOptions,
  type UploadOptions,
  transformUploadOptions,
} from '../multipart/options';
import { getMultipartRequest } from '../multipart/request';
import type { Storage } from '../storage';

export function FilesInterceptor<S extends Storage>(
  fieldname: string,
  maxCount = 1,
  options?: UploadOptions<S>,
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    private readonly options: TransformedUploadOptions<S>;

    constructor() {
      this.options = transformUploadOptions(options);
    }

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<void>> {
      const ctx = context.switchToHttp();
      const req = getMultipartRequest(ctx);

      const { body, files, remove } = await handleMultipartMultipleFiles(
        req,
        fieldname,
        maxCount,
        this.options,
      );

      req.body = body;
      req.storageFiles = files;

      return next.handle().pipe(tap(remove));
    }
  }

  return mixin(MixinInterceptor);
}
