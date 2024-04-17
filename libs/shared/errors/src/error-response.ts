import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

type ErrorResponsePartial = Pick<
  ErrorResponse,
  'statusCode' | 'path' | 'errors'
> &
  Partial<ErrorResponse>;

export class ErrorResponse {
  @IsNumber()
  statusCode: number;

  @IsString()
  @IsOptional()
  name?: string = 'ErrorResponse';

  @IsString()
  path: string;

  @IsDateString()
  @IsOptional()
  timestamp: string = new Date().toISOString();

  @IsNotEmpty()
  errors: { message: string; field?: string }[];

  @IsOptional()
  details?: Record<string, unknown>;

  constructor(partial: ErrorResponsePartial) {
    Object.assign(this, partial);
  }
}

export const isErrorResponse = (x: unknown): x is ErrorResponse =>
  typeof x === 'object' &&
  x != null &&
  'statusCode' in x &&
  typeof x?.statusCode === 'number' &&
  'errors' in x &&
  Array.isArray(x?.errors) &&
  'path' in x &&
  typeof x?.path === 'string' &&
  'timestamp' in x;
