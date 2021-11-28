import { Ticket, ticketConstraints } from '@ticketing/shared/models';
import { Expose } from 'class-transformer';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class UpdateTicket
  implements Partial<Pick<Ticket, 'title' | 'price' | 'orderId'>>
{
  @Expose()
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  @Length(ticketConstraints.title.min, ticketConstraints.title.max, {
    message: `title must be a between ${ticketConstraints.title.min} and ${ticketConstraints.title.max} characters`,
  })
  title?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(ticketConstraints.price.min)
  price?: number;

  @Expose()
  @IsOptional()
  @IsMongoId()
  orderId?: string;
}
