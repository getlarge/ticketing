import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { getMultipartRequest } from '../multipart/request';
import type { StorageFile } from '../storage/storage';

export const UploadedFile = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): StorageFile | undefined => {
    const req = getMultipartRequest(ctx.switchToHttp());
    return req?.storageFile;
  },
);
