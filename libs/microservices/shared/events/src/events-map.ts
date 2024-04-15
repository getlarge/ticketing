import { ExpirationCompletedEvent } from './expiration-events';
import { OrderCancelledEvent, OrderCreatedEvent } from './order-events';
import { Patterns } from './patterns';
import { PaymentCreatedEvent } from './payment-events';
import { TicketCreatedEvent, TicketUpdatedEvent } from './ticket-events';

export type EventsMap = {
  readonly [Patterns.TicketCreated]: TicketCreatedEvent['data'];
  readonly [Patterns.TicketUpdated]: TicketUpdatedEvent['data'];
  readonly [Patterns.OrderCreated]: OrderCreatedEvent['data'];
  readonly [Patterns.OrderCancelled]: OrderCancelledEvent['data'];
  readonly [Patterns.ExpirationCompleted]: ExpirationCompletedEvent['data'];
  readonly [Patterns.PaymentCreated]: PaymentCreatedEvent['data'];
};
