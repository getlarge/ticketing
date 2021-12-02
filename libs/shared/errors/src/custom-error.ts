export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract getDetails(): Record<string, unknown>;

  abstract serializeErrors(): { message: string; field?: string }[];
}

export const isCustomError = (error: unknown): error is CustomError =>
  error instanceof CustomError;
