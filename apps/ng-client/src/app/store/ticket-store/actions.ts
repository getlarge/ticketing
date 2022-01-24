import { Update } from '@ngrx/entity';
import { Action } from '@ngrx/store';
import { CreateTicketDto, UpdateTicketDto } from '@ticketing/ng/open-api';
import { Order, Ticket } from '@ticketing/shared/models';

import { TicketFilter } from '../../models';

export enum ActionTypes {
  LOAD_TICKETS = '[Tickets] Load Tickets',
  LOAD_TICKETS_SUCCESS = '[Ticket API] Load Tickets Success',
  LOAD_TICKETS_FAILURE = '[Ticket API] Load Tickets Failure',

  ADD_TICKET = '[List Screen] Add Ticket',
  ADD_TICKET_SUCCESS = '[Ticket API] Add Ticket Success',
  ADD_TICKET_FAILURE = '[Ticket API] Add Ticket Failure',

  FILTER_TICKETS = '[List Screen] Filter Tickets',

  UPDATE_TICKET = '[Details Screen] Update Ticket',
  UPDATE_TICKET_SUCCESS = '[Details Screen] Update Ticket Success',
  UPDATE_TICKET_FAILURE = '[Details Screen] Update Ticket Failure',

  ORDER_TICKET = '[Details Screen] Order Ticket',
  ORDER_TICKET_SUCCESS = '[Details Screen] Order Ticket Success',
  ORDER_TICKET_FAILURE = '[Details Screen] Order Ticket Failure',

  SELECT_TICKET = '[List Screen] Select Ticket',
}

export class LoadTicketsAction implements Action {
  readonly type = ActionTypes.LOAD_TICKETS;
}

export class LoadTicketsSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_TICKETS_SUCCESS;
  constructor(public payload: { tickets: Ticket[] }) {}
}

export class LoadTicketsFailureAction implements Action {
  readonly type = ActionTypes.LOAD_TICKETS_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class AddTicketAction implements Action {
  readonly type = ActionTypes.ADD_TICKET;
  constructor(public payload: { newTicket: CreateTicketDto }) {}
}

export class AddTicketSuccessAction implements Action {
  readonly type = ActionTypes.ADD_TICKET_SUCCESS;
  constructor(public payload: { ticket: Ticket }) {}
}

export class AddTicketFailureAction implements Action {
  readonly type = ActionTypes.ADD_TICKET_FAILURE;
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

export class OrderTicketAction implements Action {
  readonly type = ActionTypes.ORDER_TICKET;
  constructor(public payload: { ticketId: string }) {}
}

export class OrderTicketSuccessAction implements Action {
  readonly type = ActionTypes.ORDER_TICKET_SUCCESS;
  constructor(public payload: { ticket: Update<Ticket>, order: Order }) {}
}

export class OrderTicketFailureAction implements Action {
  readonly type = ActionTypes.ORDER_TICKET_FAILURE;
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
  | AddTicketAction
  | AddTicketSuccessAction
  | AddTicketFailureAction
  | FilterTicketsAction
  | UpdateTicketAction
  | UpdateTicketSuccessAction
  | UpdateTicketFailureAction
  | OrderTicketAction
  | OrderTicketSuccessAction
  | OrderTicketFailureAction
  | SelectTicketAction;
