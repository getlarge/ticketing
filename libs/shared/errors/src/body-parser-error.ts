import { CustomError } from './custom-error';

export class BodyParserError extends CustomError {
  public readonly name = 'BodyParserError';

  constructor(
    public statusCode: number,
    public reason: string,
    public details: Record<string, unknown> = {},
  ) {
    super('Failed to parse request body');
    Object.setPrototypeOf(this, BodyParserError.prototype);
  }

  getDetails(): Record<string, unknown> {
    return this.details;
  }

  serializeErrors(): { message: string }[] {
    return [{ message: this.reason }];
  }
}

export const isBodyParserError = (error: Error): error is BodyParserError =>
  error instanceof BodyParserError;
