import { ExpirationCompletedEvent } from './expiration-events';
import { OrderCancelledEvent, OrderCreatedEvent } from './order-events';
import { Patterns } from './patterns';
import { PaymentCreatedEvent } from './payment-events';
import { TicketCreatedEvent, TicketUpdatedEvent } from './ticket-events';

export type EventsMap = {
  [Patterns.TicketCreated]: TicketCreatedEvent;
  [Patterns.TicketUpdated]: TicketUpdatedEvent;
  [Patterns.OrderCreated]: OrderCreatedEvent;
  [Patterns.OrderCancelled]: OrderCancelledEvent;
  [Patterns.ExpirationCompleted]: ExpirationCompletedEvent;
  [Patterns.PaymentCreated]: PaymentCreatedEvent;
};
