import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { OrdersService, TicketsService } from '@ticketing/ng/open-api';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';

import { serializeError } from '../../utils/serialize-error';
import * as featureActions from './actions';

@Injectable()
export class TicketStoreEffects {
  constructor(
    private actions$: Actions,
    private ticketService: TicketsService,
    private ordersService: OrdersService
  ) {}

  loadTicketsEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.LoadTicketsAction>(
        featureActions.ActionTypes.LOAD_TICKETS
      ),
      switchMap(() =>
        this.ticketService.ticketsControllerFind().pipe(
          map(
            (tickets) =>
              new featureActions.LoadTicketsSuccessAction({ tickets })
          ),
          catchError((error) =>
            observableOf(
              new featureActions.LoadTicketsFailureAction({
                error: serializeError(error).message,
              })
            )
          )
        )
      )
    )
  );

  addTicketEffect$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.AddTicketAction>(
        featureActions.ActionTypes.ADD_TICKET
      ),
      map((action) => action.payload),
      concatMap(({ newTicket }) =>
        this.ticketService.ticketsControllerCreate({ body: newTicket }).pipe(
          map(
            (ticket) => new featureActions.AddTicketSuccessAction({ ticket })
          ),
          catchError((error) =>
            observableOf(
              new featureActions.AddTicketFailureAction({
                error: serializeError(error).message,
              })
            )
          )
        )
      )
    )
  );

  updateTicketEffect$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.UpdateTicketAction>(
        featureActions.ActionTypes.UPDATE_TICKET
      ),
      map((action) => action.payload),
      concatMap(({ ticketId, ticket }) =>
        this.ticketService
          .ticketsControllerUpdateById({ id: ticketId, body: ticket })
          .pipe(
            map(
              (updatedTicket) =>
                new featureActions.UpdateTicketSuccessAction({
                  ticket: { changes: updatedTicket, id: updatedTicket.id },
                })
            ),
            catchError((error) =>
              observableOf(
                new featureActions.UpdateTicketFailureAction({
                  error: serializeError(error).message,
                })
              )
            )
          )
      )
    )
  );

  orderTicketEffect$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.OrderTicketAction>(
        featureActions.ActionTypes.ORDER_TICKET
      ),
      map((action) => action.payload),
      concatMap(({ ticketId }) =>
        this.ordersService.ordersControllerCreate({ body: { ticketId } }).pipe(
          map(
            (order) =>
              new featureActions.OrderTicketSuccessAction({
                ticket: {
                  changes: { ...order.ticket, orderId: order.id },
                  id: order.ticket.id,
                },
                order,
              })
          ),
          catchError((error) =>
            observableOf(
              new featureActions.OrderTicketFailureAction({
                error: serializeError(error).message,
              })
            )
          )
        )
      )
    )
  );
}
