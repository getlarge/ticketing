export abstract class CustomError extends Error {
  abstract override name: string;
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract getDetails(): Record<string, unknown>;

  abstract serializeErrors(): { message: string; field?: string }[];

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      details: this.getDetails(),
      errors: this.serializeErrors(),
    };
  }
}

export const isCustomError = (error: unknown): error is CustomError =>
  error instanceof CustomError;
