import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class Ticket {
  id: string;

  @Expose()
  @IsString({ message: 'title must be a string' })
  title: string;

  @Expose()
  @IsNumber()
  price: number;

  @Expose()
  @IsNumber()
  version: number;
}
