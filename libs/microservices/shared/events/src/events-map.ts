import { ExpirationCompletedEvent } from './expiration-events';
import { OrderCancelledEvent, OrderCreatedEvent } from './order-events';
import { Patterns } from './patterns';
import { PaymentCreatedEvent } from './payment-events';
import { TicketCreatedEvent, TicketUpdatedEvent } from './ticket-events';

export type EventsMap = {
  [Patterns.TicketCreated]: TicketCreatedEvent['data'];
  [Patterns.TicketUpdated]: TicketUpdatedEvent['data'];
  [Patterns.OrderCreated]: OrderCreatedEvent['data'];
  [Patterns.OrderCancelled]: OrderCancelledEvent['data'];
  [Patterns.ExpirationCompleted]: ExpirationCompletedEvent['data'];
  [Patterns.PaymentCreated]: PaymentCreatedEvent['data'];
};
