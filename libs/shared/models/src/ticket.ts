import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class Ticket {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;

  @Expose()
  @IsString({ message: 'title must be a string' })
  title: string;

  @Expose()
  @IsNumber()
  price: number;

  userId: string;
}
