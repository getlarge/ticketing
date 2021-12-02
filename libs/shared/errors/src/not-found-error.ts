import { CustomError } from './custom-error';

export class NotFoundError extends CustomError {
  statusCode = 404;
  reason = 'Not found';

  constructor(public details: Record<string, unknown> = {}) {
    super('Route not found');
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  getDetails(): Record<string, unknown> {
    return this.details;
  }

  serializeErrors(): { message: string }[] {
    return [{ message: this.reason }];
  }
}

export const isNotFoundError = (error: Error): error is NotFoundError =>
  error instanceof NotFoundError;
