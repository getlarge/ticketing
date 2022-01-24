import { Action } from '@ngrx/store';
import { Order } from '@ticketing/shared/models';

import { OrderFilter } from '../../models';

export enum ActionTypes {
  LOAD_ORDERS = '[Tickets] Load Orders',
  LOAD_ORDERS_SUCCESS = '[Ticket API] Load Orders Success',
  LOAD_ORDERS_FAILURE = '[Ticket API] Load Orders Failure',

  FILTER_ORDERS = '[List Screen] Filter Orders',

  SELECT_ORDER = '[List Screen] Select Order',
}

export class LoadOrdersAction implements Action {
  readonly type = ActionTypes.LOAD_ORDERS;
}

export class LoadOrdersSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_ORDERS_SUCCESS;
  constructor(public payload: { orders: Order[] }) {}
}

export class LoadOrdersFailureAction implements Action {
  readonly type = ActionTypes.LOAD_ORDERS_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class FilterOrdersAction implements Action {
  readonly type = ActionTypes.FILTER_ORDERS;
  constructor(public payload: { filter: OrderFilter }) {}
}

export class SelectOrderAction implements Action {
  readonly type = ActionTypes.SELECT_ORDER;
  constructor(public payload: { orderId: string }) {}
}

export type ActionsUnion =
  | LoadOrdersAction
  | LoadOrdersFailureAction
  | LoadOrdersSuccessAction
  | FilterOrdersAction
  | SelectOrderAction;
