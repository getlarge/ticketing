import { Order as BaseOrder } from '@ticketing/shared/models';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { Ticket } from './ticket';

export class Order extends BaseOrder {
  @Expose()
  @Type(() => Ticket)
  @ValidateNested()
  ticket: Ticket;
}
