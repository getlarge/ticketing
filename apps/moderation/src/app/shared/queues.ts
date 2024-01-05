import { Moderation, Ticket } from '@ticketing/shared/models';

export enum QueueNames {
  MODERATE_TICKET = 'moderate-ticket',
}

export interface ModerateTicket {
  ticket: Ticket;
  moderation: Moderation;
  ctx?: Record<string, unknown>;
}
