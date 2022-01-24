import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { OrdersService } from '@ticketing/ng/open-api';
import { debounceTime, Observable, of as observableOf } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';

import { transformError } from '../../utils/serialize-error';
import * as featureActions from './actions';

@Injectable()
export class OrderStoreEffects {
  constructor(
    private actions$: Actions,
    private ordersService: OrdersService
  ) {}

  createOrderEffect$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.CreateOrderAction>(
        featureActions.ActionTypes.CREATE_ORDER
      ),
      map((action) => action.payload),
      concatMap(({ ticketId }) =>
        this.ordersService.ordersControllerCreate({ body: { ticketId } }).pipe(
          map(
            (order) => new featureActions.CreateOrderSuccessAction({ order })
            // TODO: update ticket-store ?
          ),
          catchError((error) =>
            observableOf(
              new featureActions.CreateOrderFailureAction({
                error: transformError(error),
              })
            )
          )
        )
      )
    )
  );

  cancelOrderEffect$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.CancelOrderAction>(
        featureActions.ActionTypes.CANCEL_ORDER
      ),
      map((action) => action.payload),
      concatMap(({ orderId }) =>
        this.ordersService.ordersControllerCancelById({ id: orderId }).pipe(
          map(
            (order) =>
              new featureActions.CancelOrderSuccessAction({
                order: { changes: order, id: order.id },
              })
          ),
          catchError((error) =>
            observableOf(
              new featureActions.CancelOrderFailureAction({
                error: transformError(error),
              })
            )
          )
        )
      )
    )
  );

  loadOrdersEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.LoadOrdersAction>(
        featureActions.ActionTypes.LOAD_ORDERS
      ),
      debounceTime(500),
      switchMap(() =>
        this.ordersService.ordersControllerFind().pipe(
          map(
            (orders) => new featureActions.LoadOrdersSuccessAction({ orders })
          ),
          catchError((error) =>
            observableOf(
              new featureActions.LoadOrdersFailureAction({
                error: transformError(error),
              })
            )
          )
        )
      )
    )
  );
}
