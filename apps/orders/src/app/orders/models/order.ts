import { Order as BaseOrder } from '@ticketing/shared/models';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { Ticket } from '../../tickets/models';

export class Order extends BaseOrder {
  @Expose()
  @Type(() => Ticket)
  @ValidateNested()
  declare ticket: Ticket;
}
