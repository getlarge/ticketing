import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ErrorResponse {
  @IsNumber()
  statusCode: number;

  @IsString()
  path: string;

  @IsDateString()
  timestamp: string;

  @IsNotEmpty()
  errors: { message: string; field?: string }[];
}
