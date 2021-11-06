import { HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

export const ErrorTypeStatusMap = {
  'request.aborted': HttpStatus.BAD_REQUEST,
  'encoding.unsupported': HttpStatus.UNSUPPORTED_MEDIA_TYPE,
  'entity.too.large': HttpStatus.PAYLOAD_TOO_LARGE,
  'request.size.invalid': HttpStatus.BAD_REQUEST,
  'parameters.too.many': HttpStatus.PAYLOAD_TOO_LARGE,
  'stream.encoding.set': HttpStatus.INTERNAL_SERVER_ERROR,
};

export function handleBodyParserErrors(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  req: Request,
  res: Response,
  next: (error?: Error | HttpException) => unknown
) {
  if (err && 'type' in err) {
    const status = ErrorTypeStatusMap[err.type];
    const exception = new HttpException(err.message, status);
    next(exception);
  } else {
    next();
  }
}
