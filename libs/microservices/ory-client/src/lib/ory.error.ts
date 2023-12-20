import {
  type RelationTuple,
  relationTupleToString,
} from '@ticketing/microservices/shared/relation-tuple-parser';
import { CustomError } from '@ticketing/shared/errors';
import { isAxiosError } from 'axios';

export class OryError extends CustomError {
  constructor(
    readonly error: unknown,
    readonly defaultStatus = 500,
    readonly defaultReason = 'Error connecting to the Ory Keto API',
  ) {
    super(OryError.parseError(error));
    Object.setPrototypeOf(this, OryError.prototype);
  }

  static parseError(error: unknown): string {
    if (isAxiosError(error)) {
      return error.response?.data?.error?.message ?? error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error';
  }

  get errorMessage(): string {
    return OryError.parseError(this.error) ?? this.defaultReason;
  }

  get statusCode(): number {
    return isAxiosError(this.error)
      ? this.error.response?.status ?? this.defaultStatus
      : this.defaultStatus;
  }

  getDetails(): Record<string, unknown> {
    if (isAxiosError(this.error)) {
      return this.error.response?.data ?? {};
    }
    return {};
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [{ message: this.errorMessage }];
  }
}

export class OryPermissionError extends OryError {
  constructor(
    error: unknown,
    readonly tuple?: Partial<RelationTuple>,
    defaultStatus = 500,
    defaultReason = 'Error connecting to the Ory Keto API',
  ) {
    super(error, defaultStatus, defaultReason);
    Object.setPrototypeOf(this, OryPermissionError.prototype);
  }

  get tupleString(): string {
    return this.tuple ? relationTupleToString(this.tuple) : '';
  }

  override serializeErrors(): { message: string; field?: string }[] {
    return [{ message: this.errorMessage, field: this.tupleString }];
  }
}
