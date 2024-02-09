import {
  CallHandler,
  ExecutionContext,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { handleMultipartSingleFile } from '../multipart/handlers/single-file';
import {
  type TransformedUploadOptions,
  type UploadOptions,
  transformUploadOptions,
} from '../multipart/options';
import { getMultipartRequest } from '../multipart/request';
import type { Storage } from '../storage';

export function FileInterceptor<S extends Storage>(
  fieldname: string,
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

      const { file, body, remove } = await handleMultipartSingleFile(
        req,
        fieldname,
        this.options,
      );
      req.body = body;
      req.storageFile = file;
      return next.handle().pipe(tap(remove));
    }
  }

  return mixin(MixinInterceptor);
}
