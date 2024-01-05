import {
  Ticket as TicketModel,
} from '@ticketing/shared/models';
import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class Ticket implements Pick<TicketModel, 'title' | 'price'> {
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
