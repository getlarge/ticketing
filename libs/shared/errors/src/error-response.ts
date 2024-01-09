import { plainToInstance } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
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

export const isErrorResponse = (error: unknown): error is ErrorResponse =>
  validateSync(plainToInstance(ErrorResponse, error)).length === 0;
