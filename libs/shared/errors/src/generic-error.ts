import { CustomError } from './custom-error';
import { ErrorResponse } from './error-response';

export class GenericError extends CustomError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly path: string = '',
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    Object.setPrototypeOf(this, GenericError.prototype);
  }

  getDetails(): Record<string, unknown> {
    return this.details;
  }

  serializeErrors(): { message: string }[] {
    return [{ message: this.message }];
  }

  toErrorResponse(): ErrorResponse {
    return new ErrorResponse({
      name: this.name,
      statusCode: this.statusCode,
      errors: this.serializeErrors(),
      details: this.getDetails(),
      path: this.path,
    });
  }
}

export function isGenericError(error: unknown): error is GenericError {
  return error instanceof GenericError;
}
