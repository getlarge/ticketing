import { Update } from '@ngrx/entity';
import { Action } from '@ngrx/store';
import {
  CreateTicketDto,
  NextPaginationDto,
  UpdateTicketDto,
} from '@ticketing/ng/open-api';
import { Ticket } from '@ticketing/shared/models';

import { Paginate, TicketFilter } from '../../models';

export enum ActionTypes {
  LOAD_TICKETS = '[Tickets] Load Tickets',
  LOAD_TICKETS_SUCCESS = '[Ticket API] Load Tickets Success',
  LOAD_TICKETS_FAILURE = '[Ticket API] Load Tickets Failure',

  LOAD_TICKET = '[Tickets] Load Ticket',
  LOAD_TICKET_SUCCESS = '[Ticket API] Load Ticket Success',
  LOAD_TICKET_FAILURE = '[Ticket API] Load Ticket Failure',

  CREATE_TICKET = '[List Screen] Create Ticket',
  CREATE_TICKET_SUCCESS = '[Ticket API] Create Ticket Success',
  CREATE_TICKET_FAILURE = '[Ticket API] Create Ticket Failure',

  UPDATE_TICKET = '[Details Screen] Update Ticket',
  UPDATE_TICKET_SUCCESS = '[Details Screen] Update Ticket Success',
  UPDATE_TICKET_FAILURE = '[Details Screen] Update Ticket Failure',

  FILTER_TICKETS = '[List Screen] Filter Tickets',

  SELECT_TICKET = '[List Screen] Select Ticket',
}

export class LoadTicketsAction implements Action {
  readonly type = ActionTypes.LOAD_TICKETS;
  constructor(public payload?: { paginate?: Paginate }) {}
}

export class LoadTicketsSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_TICKETS_SUCCESS;
  constructor(
    public payload: { tickets: Ticket[]; next: NextPaginationDto[] }
  ) {}
}

export class LoadTicketsFailureAction implements Action {
  readonly type = ActionTypes.LOAD_TICKETS_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class LoadTicketAction implements Action {
  readonly type = ActionTypes.LOAD_TICKET;
  constructor(public payload: { ticketId: string }) {}
}

export class LoadTicketSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_TICKET_SUCCESS;
  constructor(public payload: { ticket: Ticket }) {}
}

export class LoadTicketFailureAction implements Action {
  readonly type = ActionTypes.LOAD_TICKET_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class CreateTicketAction implements Action {
  readonly type = ActionTypes.CREATE_TICKET;
  constructor(public payload: { newTicket: CreateTicketDto }) {}
}

export class CreateTicketSuccessAction implements Action {
  readonly type = ActionTypes.CREATE_TICKET_SUCCESS;
  constructor(public payload: { ticket: Ticket }) {}
}

export class CreateTicketFailureAction implements Action {
  readonly type = ActionTypes.CREATE_TICKET_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class FilterTicketsAction implements Action {
  readonly type = ActionTypes.FILTER_TICKETS;
  constructor(public payload: { filter: TicketFilter }) {}
}

export class UpdateTicketAction implements Action {
  readonly type = ActionTypes.UPDATE_TICKET;
  constructor(public payload: { ticketId: string; ticket: UpdateTicketDto }) {}
}

export class UpdateTicketSuccessAction implements Action {
  readonly type = ActionTypes.UPDATE_TICKET_SUCCESS;
  constructor(public payload: { ticket: Update<Ticket> }) {}
}

export class UpdateTicketFailureAction implements Action {
  readonly type = ActionTypes.UPDATE_TICKET_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class SelectTicketAction implements Action {
  readonly type = ActionTypes.SELECT_TICKET;
  constructor(public payload: { ticketId: string }) {}
}

export type ActionsUnion =
  | LoadTicketsAction
  | LoadTicketsFailureAction
  | LoadTicketsSuccessAction
  | LoadTicketAction
  | LoadTicketFailureAction
  | LoadTicketSuccessAction
  | CreateTicketAction
  | CreateTicketSuccessAction
  | CreateTicketFailureAction
  | FilterTicketsAction
  | UpdateTicketAction
  | UpdateTicketSuccessAction
  | UpdateTicketFailureAction
  | SelectTicketAction;
