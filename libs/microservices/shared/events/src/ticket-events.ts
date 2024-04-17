import { OmitType } from '@nestjs/mapped-types';
import { Ticket, TicketStatus } from '@ticketing/shared/models';
import { Expose } from 'class-transformer';
import { IsIn } from 'class-validator';

import { Event } from './event';
import { Patterns } from './patterns';

export class TicketEventData extends Ticket {}

export class TicketCreatedEvent implements Event {
  static readonly data = TicketEventData;
  static readonly name = Patterns.TicketCreated as const;
  name = TicketCreatedEvent.name;
  data = new TicketCreatedEvent.data();
}

export class TicketUpdatedEvent implements Event {
  static readonly data = TicketEventData;
  static readonly name = Patterns.TicketUpdated as const;
  name = TicketUpdatedEvent.name;
  data = new TicketUpdatedEvent.data();
}

export class TicketApprovedEventData extends OmitType(Ticket, ['status']) {
  @Expose()
  @IsIn([TicketStatus.Approved])
  status = TicketStatus.Approved;
}

export class TicketApprovedEvent implements Event {
  static readonly data = TicketApprovedEventData;
  static readonly name = Patterns.TicketApproved as const;
  name = TicketApprovedEvent.name;
  data = new TicketApprovedEvent.data();
}

class TicketRejectedEventData extends OmitType(Ticket, ['status']) {
  @Expose()
  @IsIn([TicketStatus.Rejected])
  status = TicketStatus.Rejected;
}
export class TicketRejectedEvent implements Event {
  static readonly data = TicketRejectedEventData;
  static readonly name = Patterns.TicketRejected as const;
  name = TicketRejectedEvent.name;
  data = new TicketRejectedEvent.data();
}
