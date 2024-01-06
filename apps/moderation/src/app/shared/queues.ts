import { Moderation, ModerationTicket } from '@ticketing/shared/models';

export enum QueueNames {
  MODERATE_TICKET = 'moderate-ticket',
}

export interface ModerateTicket {
  ticket: ModerationTicket;
  moderation: Moderation;
  ctx?: Record<string, unknown>;
}
