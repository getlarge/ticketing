import { Ticket } from '@ticketing/shared/models';

import { Event } from './event';
import { Patterns } from './patterns';

export class TicketCreatedEvent implements Event {
  static readonly data = Ticket;
  static readonly name = Patterns.TicketCreated as const;
  name = TicketCreatedEvent.name;
  data = new TicketCreatedEvent.data();
}

export class TicketUpdatedEvent implements Event {
  static readonly data = Ticket;
  static readonly name = Patterns.TicketUpdated as const;
  name = TicketUpdatedEvent.name;
  data = new TicketUpdatedEvent.data();
}
