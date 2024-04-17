import { Resources } from '@ticketing/shared/constants';
import {
  Moderation,
  ModerationStatus,
  ModerationTicket,
  TicketStatus,
} from '@ticketing/shared/models';

export const enum EventStatus {
  CREATED = 'created',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  MANUAL_REVIEW_REQUIRED = 'manual_review_required',
}

export type EventName = `${string}/${EventStatus}/*`;

export const TICKET_CREATED_EVENT = `${Resources.TICKETS}/${EventStatus.CREATED}/*`;
export const TICKET_APPROVED_EVENT = `${Resources.TICKETS}/${EventStatus.APPROVED}/*`;
export const TICKET_REJECTED_EVENT = `${Resources.TICKETS}/${EventStatus.REJECTED}/*`;
export const TICKET_MANUAL_REVIEW_REQUIRED_EVENT = `${Resources.TICKETS}/${EventStatus.MANUAL_REVIEW_REQUIRED}/*`;

export type TicketEvent = { ticket: ModerationTicket };
export type TicketCreatedEvent = TicketEvent & {
  ctx?: Record<string, unknown>;
};
export type TicketApprovedEvent = TicketEvent & {
  ticket: Omit<ModerationTicket, 'status'> & { status: TicketStatus.Approved };
  moderation: Omit<Moderation, 'status'> & {
    status: ModerationStatus.Approved;
  };
  ctx?: Record<string, unknown>;
};
export type TicketRejectedEvent = TicketEvent & {
  ticket: Omit<ModerationTicket, 'status'> & { status: TicketStatus.Rejected };
  moderation: Omit<Moderation, 'status'> & {
    status: ModerationStatus.Rejected;
  };
  ctx?: Record<string, unknown>;
};
export type TicketManualReviewRequiredEvent = TicketEvent & {
  ticket: Omit<ModerationTicket, 'status'> & {
    status: TicketStatus.WaitingModeration;
  };
  moderation: Omit<Moderation, 'status'> & {
    status: ModerationStatus.RequiresManualReview;
  };
  ctx?: Record<string, unknown>;
};
export type EventsMap = {
  [TICKET_CREATED_EVENT]: TicketCreatedEvent;
  [TICKET_APPROVED_EVENT]: TicketApprovedEvent;
  [TICKET_REJECTED_EVENT]: TicketRejectedEvent;
  [TICKET_MANUAL_REVIEW_REQUIRED_EVENT]: TicketManualReviewRequiredEvent;
};