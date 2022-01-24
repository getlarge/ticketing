import { plainToInstance } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export class ErrorResponse {
  @IsNumber()
  statusCode: number;

  @IsString()
  path: string;

  @IsDateString()
  timestamp: string;

  @IsNotEmpty()
  errors: { message: string; field?: string }[];

  @IsOptional()
  details?: Record<string, unknown>;
}

export const isErrorResponse = (error: unknown): error is ErrorResponse =>
  validateSync(plainToInstance(ErrorResponse, error)).length === 0;
