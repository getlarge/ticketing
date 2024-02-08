import {
  BadRequestException,
  HttpException,
  PayloadTooLargeException,
} from '@nestjs/common';

export function transformException(err: undefined): undefined;
export function transformException(err: HttpException): HttpException;
export function transformException(err: Error): Error;
export function transformException(
  err: Error & { code: string },
): HttpException;
export function transformException(
  err: Error | undefined,
): Error | undefined | HttpException {
  if (
    !err ||
    err instanceof HttpException ||
    !('code' in err) ||
    typeof err.code !== 'string'
  ) {
    return err;
  }

  switch (err.code) {
    case 'FST_REQ_FILE_TOO_LARGE':
      return new PayloadTooLargeException();
    case 'FST_PARTS_LIMIT':
    case 'FST_FILES_LIMIT':
    case 'FST_PROTO_VIOLATION':
    case 'FST_INVALID_MULTIPART_CONTENT_TYPE':
      return new BadRequestException(err.message);
  }

  return err;
}
