import { ticketConstraints } from '@ticketing/shared/models';
import { Expose } from 'class-transformer';
import { IsNumber, IsString, Length, Min } from 'class-validator';

export class CreateTicket {
  @Expose()
  @IsString({ message: 'title must be a string' })
  @Length(ticketConstraints.title.min, ticketConstraints.title.max, {
    message: `title must be a between ${ticketConstraints.title.min} and ${ticketConstraints.title.max} characters`,
  })
  title: string;

  @Expose()
  @IsNumber()
  @Min(ticketConstraints.price.min)
  price: number;
}
