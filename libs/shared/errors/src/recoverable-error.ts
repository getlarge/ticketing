import { GenericError } from './generic-error';

/**
 * @description Recoverable errors are errors that can be resolved by requeuing the message on the consumer side.
 * @example
 * - A request to an internal service that is currently unavailable.
 * - A request to an internal service that is currently overloaded.
 * - A request that is being throttled.
 *
 */
export class RecoverableError extends GenericError {
  public readonly name = 'RecoverableError';

  constructor(
    message: string,
    statusCode: number,
    path: string,
    details: Record<string, unknown> = {},
  ) {
    super(message, statusCode, path, details);
    Object.setPrototypeOf(this, RecoverableError.prototype);
  }
}

export function isRecoverableError(error: unknown): error is RecoverableError {
  return error instanceof RecoverableError;
}
