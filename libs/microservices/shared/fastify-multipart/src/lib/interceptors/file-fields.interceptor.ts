import {
  CallHandler,
  ExecutionContext,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import {
  handleMultipartFileFields,
  UploadField,
  UploadFieldMapEntry,
  uploadFieldsToMap,
} from '../multipart/handlers/file-fields';
import {
  type TransformedUploadOptions,
  type UploadOptions,
  transformUploadOptions,
} from '../multipart/options';
import { getMultipartRequest } from '../multipart/request';
import type { Storage } from '../storage';

export function FileFieldsInterceptor<S extends Storage>(
  uploadFields: UploadField[],
  options?: UploadOptions<S>,
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    private readonly options: TransformedUploadOptions<S>;

    private readonly fieldsMap: Map<string, UploadFieldMapEntry>;

    constructor() {
      this.options = transformUploadOptions(options);
      this.fieldsMap = uploadFieldsToMap(uploadFields);
    }

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<void>> {
      const ctx = context.switchToHttp();
      const req = getMultipartRequest(ctx);

      const { body, files, remove } = await handleMultipartFileFields(
        req,
        this.fieldsMap,
        this.options,
      );

      req.body = body;
      req.storageFiles = files;

      return next.handle().pipe(tap(remove));
    }
  }

  const Interceptor = mixin(MixinInterceptor);

  return Interceptor;
}
