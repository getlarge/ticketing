import { GenericError } from './generic-error';

/**
 * Acceptable errors are errors that protects the system from unexpected / undesired entries, and that cannot be resolved by retrying or requeuing the message.
 * @example
 * - A request with invalid credentials.
 * - A request with invalid data.
 * - A request with invalid parameters.
 * - A request with dangerous data.
 */
export class AcceptableError extends GenericError {
  public readonly name = 'AcceptableError';

  constructor(
    message: string,
    statusCode: number,
    path: string,
    details: Record<string, unknown> = {},
  ) {
    super(message, statusCode, path, details);
    Object.setPrototypeOf(this, AcceptableError.prototype);
  }
}

export function isAcceptableError(error: unknown): error is AcceptableError {
  return error instanceof AcceptableError;
}
