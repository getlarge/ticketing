import { Update } from '@ngrx/entity';
import { Action } from '@ngrx/store';
import { Order, Payment } from '@ticketing/shared/models';

import { OrderFilter } from '../../models';

export enum ActionTypes {
  CREATE_ORDER = '[Order] Create Order',
  CREATE_ORDER_SUCCESS = '[Order API] Create Order Success',
  CREATE_ORDER_FAILURE = '[Order API] Create Order Failure',

  CANCEL_ORDER = '[Order] Cancel Order',
  CANCEL_ORDER_SUCCESS = '[Order API] Cancel Order Success',
  CANCEL_ORDER_FAILURE = '[Order API] Cancel Order Failure',

  LOAD_ORDERS = '[Orders] Load Orders',
  LOAD_ORDERS_SUCCESS = '[Order API] Load Orders Success',
  LOAD_ORDERS_FAILURE = '[Order API] Load Orders Failure',

  LOAD_ORDER = '[Orders] Load Order',
  LOAD_ORDER_SUCCESS = '[Order API] Load Order Success',
  LOAD_ORDER_FAILURE = '[Order API] Load Order Failure',

  PAY_ORDER = '[Orders] Pay Order',
  PAY_ORDER_SUCCESS = '[Payment API] Pay Order Success',
  PAY_ORDER_FAILURE = '[Payment API] Pay Order Failure',

  FILTER_ORDERS = '[List Screen] Filter Orders',

  SELECT_ORDER = '[List Screen] Select Order',
}

export class CreateOrderAction implements Action {
  readonly type = ActionTypes.CREATE_ORDER;
  constructor(public payload: { ticketId: string }) {}
}

export class CreateOrderSuccessAction implements Action {
  readonly type = ActionTypes.CREATE_ORDER_SUCCESS;
  constructor(public payload: { order: Order }) {}
}

export class CreateOrderFailureAction implements Action {
  readonly type = ActionTypes.CREATE_ORDER_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class CancelOrderAction implements Action {
  readonly type = ActionTypes.CANCEL_ORDER;
  constructor(public payload: { orderId: string }) {}
}

export class CancelOrderSuccessAction implements Action {
  readonly type = ActionTypes.CANCEL_ORDER_SUCCESS;
  constructor(public payload: { order: Update<Order> }) {}
}

export class CancelOrderFailureAction implements Action {
  readonly type = ActionTypes.CANCEL_ORDER_FAILURE;
  constructor(public payload: { error: string }) {}
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

export class LoadOrderAction implements Action {
  readonly type = ActionTypes.LOAD_ORDER;
  constructor(public payload: { orderId: string }) {}
}

export class LoadOrderSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_ORDER_SUCCESS;
  constructor(public payload: { order: Order }) {}
}

export class LoadOrderFailureAction implements Action {
  readonly type = ActionTypes.LOAD_ORDER_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class PayOrderAction implements Action {
  readonly type = ActionTypes.PAY_ORDER;
  constructor(public payload: { orderId: string; token: string }) {}
}

export class PayOrderSuccessAction implements Action {
  readonly type = ActionTypes.PAY_ORDER_SUCCESS;
  constructor(public payload: { payment: Payment }) {}
}

export class PayOrderFailureAction implements Action {
  readonly type = ActionTypes.PAY_ORDER_FAILURE;
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
  | CreateOrderAction
  | CreateOrderFailureAction
  | CreateOrderSuccessAction
  | CancelOrderAction
  | CancelOrderFailureAction
  | CancelOrderSuccessAction
  | LoadOrdersAction
  | LoadOrdersFailureAction
  | LoadOrdersSuccessAction
  | LoadOrderAction
  | LoadOrderFailureAction
  | LoadOrderSuccessAction
  | PayOrderAction
  | PayOrderFailureAction
  | PayOrderSuccessAction
  | FilterOrdersAction
  | SelectOrderAction;
