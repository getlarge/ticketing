import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom-error';

export class BodyParserError extends CustomError {
  constructor(public statusCode: HttpStatus, public reason: string) {
    super('Failed to parse request body');
    Object.setPrototypeOf(this, BodyParserError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}

export const isBodyParserError = (error: Error): error is BodyParserError =>
  error instanceof BodyParserError;
