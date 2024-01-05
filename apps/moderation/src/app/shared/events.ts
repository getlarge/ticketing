import { Resources } from '@ticketing/shared/constants';
import { Moderation, Ticket } from '@ticketing/shared/models';

export const enum EventStatus {
  CREATED = 'created',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export type EventName = `${string}/${EventStatus}/*`;

export const TICKET_CREATED_EVENT: EventName = `${Resources.TICKETS}/${EventStatus.CREATED}/*`;
export const TICKET_APPROVED_EVENT: EventName = `${Resources.TICKETS}/${EventStatus.APPROVED}/*`;
export const TICKET_REJECTED_EVENT: EventName = `${Resources.TICKETS}/${EventStatus.REJECTED}/*`;

export type TicketEvent = { ticket: Ticket };
export type TicketCreatedEvent = TicketEvent & {
  ctx?: Record<string, unknown>;
};
export type TicketApprovedEvent = TicketEvent & {
  moderation: Moderation;
  ctx?: Record<string, unknown>;
};
export type TicketRejectedEvent = TicketEvent & {
  moderation: Moderation;
  ctx?: Record<string, unknown>;
};
