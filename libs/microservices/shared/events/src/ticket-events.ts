import { Ticket } from '@ticketing/shared/models';

import { Event } from './event';
import { Patterns } from './patterns';

export interface TicketCreatedEvent extends Event {
  name: Patterns.TicketCreated;
  data: Ticket;
}

export interface TicketUpdatedEvent extends Event {
  subject: Patterns.TicketUpdated;
  data: Ticket;
}
