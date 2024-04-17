import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @Expose()
  @IsOptional()
  @IsString()
  scope?: string;
}
