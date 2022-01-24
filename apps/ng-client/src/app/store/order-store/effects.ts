import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { OrdersService } from '@ticketing/ng/open-api';
import { of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { serializeError } from '../../utils/serialize-error';
import * as featureActions from './actions';

@Injectable()
export class OrderStoreEffects {
  constructor(
    private actions$: Actions,
    private ordersService: OrdersService
  ) {}

  loadOrdersEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.LoadOrdersAction>(
        featureActions.ActionTypes.LOAD_ORDERS
      ),
      switchMap(() =>
        this.ordersService.ordersControllerFind().pipe(
          map(
            (orders) => new featureActions.LoadOrdersSuccessAction({ orders })
          ),
          catchError((error) =>
            observableOf(
              new featureActions.LoadOrdersFailureAction({
                error: serializeError(error).message,
              })
            )
          )
        )
      )
    )
  );
}
