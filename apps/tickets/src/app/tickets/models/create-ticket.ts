import { Expose } from 'class-transformer';
import { IsNumber, IsString, Length, Min } from 'class-validator';

import { ticketContraints } from './ticket-constraints';

export class CreateTicket {
  @Expose()
  @IsString({ message: 'title must be a string' })
  @Length(ticketContraints.title.min, ticketContraints.title.max, {
    message: `title must be a between ${ticketContraints.title.min} and ${ticketContraints.title.max} characters`,
  })
  title: string;

  @Expose()
  @IsNumber()
  @Min(ticketContraints.price.min)
  price: number;
}
