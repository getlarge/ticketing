import { Order } from '@ticketing/shared/models';

import { Event } from './event';
import { Patterns } from './patterns';

export interface OrderCreatedEvent extends Event {
  name: Patterns.OrderCreated;
  data: Omit<Order, 'ticket'> & {
    ticket: { id: string; price: number };
  };
}

export interface OrderCancelledEvent extends Event {
  subject: Patterns.OrderCancelled;
  data: Omit<Order, 'ticket'> & {
    ticket: { id: string };
  };
}
