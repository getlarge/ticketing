import { GenericError } from './generic-error';

/**
 * Unidentified errors are errors that we have not anticipate. A smart way to handle those errors is to log them, send them to a dead letter queue and drop the message.
 */
export class UnidentifiedError extends GenericError {
  public readonly name = 'UnidentifiedError';

  constructor(
    message: string,
    statusCode: number,
    path: string,
    details: Record<string, unknown> = {},
  ) {
    super(message, statusCode, path, details);
    Object.setPrototypeOf(this, UnidentifiedError.prototype);
  }
}

export function isUnidentifiedError(
  error: unknown,
): error is UnidentifiedError {
  return error instanceof UnidentifiedError;
}
