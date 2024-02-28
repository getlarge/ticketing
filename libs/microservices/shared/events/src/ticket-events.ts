import { Ticket, TicketStatus } from '@ticketing/shared/models';

import { Event } from './event';
import { Patterns } from './patterns';

export interface TicketCreatedEvent extends Event {
  name: Patterns.TicketCreated;
  data: Ticket;
}

export interface TicketUpdatedEvent extends Event {
  name: Patterns.TicketUpdated;
  data: Ticket;
}

export interface TicketApprovedEvent extends Event {
  name: Patterns.TicketApproved;
  data: Omit<Ticket, 'status'> & { status: TicketStatus.Approved };
}

export interface TicketRejectedEvent extends Event {
  name: Patterns.TicketRejected;
  data: Omit<Ticket, 'status'> & { status: TicketStatus.Rejected };
}
