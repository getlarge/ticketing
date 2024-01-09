import { GenericError } from './generic-error';

/**
 * @description Retriable errors are errors that can be resolved by retrying the request on the producer side.
 * @example
 * - A request to a service that is currently unavailable.
 * - A request to a service that is currently overloaded.
 * - A request that is being throttled.
 * - A request that is being rate limited.
 * - A request that is being blocked by a firewall.
 * - A request that is being timed out.
 */
export class RetriableError extends GenericError {
  public readonly name = 'RetriableError';

  constructor(
    message: string,
    statusCode: number,
    path: string,
    details: Record<string, unknown> = {},
  ) {
    super(message, statusCode, path, details);
    Object.setPrototypeOf(this, RetriableError.prototype);
  }
}

export function isRetriableError(error: unknown): error is RetriableError {
  return error instanceof RetriableError;
}
