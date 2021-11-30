import { PickType } from '@nestjs/swagger';
import {
  Order as BaseOrder,
  ticketConstraints,
} from '@ticketing/shared/models';
import { Expose } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class Order extends PickType(BaseOrder, [
  'id',
  'status',
  'userId',
  'version',
] as const) {
  @Expose()
  @IsNumber()
  @Min(ticketConstraints.price.min)
  price: number;
}
