import { ValidationError } from 'express-validator';

import { CustomError } from './custom-error';

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public readonly errors: ValidationError[]) {
    super('Invalid request parameters');
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map(({ msg, param }) => ({
      message: msg,
      field: param,
    }));
  }
}

export const isRequestValidationError = (
  error: Error
): error is RequestValidationError => error instanceof RequestValidationError;
