import { OmitType, PickType } from '@nestjs/mapped-types';
import { Order, Ticket } from '@ticketing/shared/models';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { Event } from './event';
import { Patterns } from './patterns';

class OrderCreatedTicket extends PickType(Ticket, ['id', 'price']) {}

export class OrderCreatedEventData extends OmitType(Order, ['ticket']) {
  @Type(() => OrderCreatedTicket)
  @ValidateNested()
  ticket: OrderCreatedTicket;
}

export class OrderCreatedEvent implements Event {
  static readonly data = OrderCreatedEventData;
  static readonly name = Patterns.OrderCreated as const;
  name = OrderCreatedEvent.name;
  data = new OrderCreatedEvent.data();
}

class OrderCancelledTicket extends PickType(Ticket, ['id']) {}

class OrderCancelledEventData extends OmitType(Order, ['ticket']) {
  @Type(() => OrderCancelledTicket)
  @ValidateNested()
  ticket: OrderCancelledTicket;
}

export class OrderCancelledEvent implements Event {
  static readonly data = OrderCreatedEventData;
  static readonly name = Patterns.OrderCancelled as const;
  name = OrderCancelledEvent.name;
  data = new OrderCancelledEventData();
}
