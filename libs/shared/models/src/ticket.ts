import { Expose } from 'class-transformer';
import { IsNumber, IsString, Length, Min } from 'class-validator';

export const ticketConstraints = {
  title: {
    min: 3,
    max: 56,
  },
  price: {
    min: 0,
  },
};

export class Ticket {
  id: string;

  @Expose()
  @IsString({ message: 'title must be a string' })
  @Length(ticketConstraints.title.min, ticketConstraints.title.max)
  title: string;

  @Expose()
  @IsNumber()
  @Min(ticketConstraints.price.min)
  price: number;

  @Expose()
  @IsNumber()
  version: number;

  // @IsMongoId()
  userId: string;
}
