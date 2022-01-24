import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { TicketsService } from '@ticketing/ng/open-api';
import { debounceTime, Observable, of as observableOf } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';

import { transformError } from '../../utils/serialize-error';
import * as featureActions from './actions';

@Injectable()
export class TicketStoreEffects {
  constructor(
    private actions$: Actions,
    private ticketService: TicketsService
  ) {}

  loadTicketsEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.LoadTicketsAction>(
        featureActions.ActionTypes.LOAD_TICKETS
      ),
      debounceTime(500),
      switchMap(() =>
        this.ticketService.ticketsControllerFind().pipe(
          map(
            (tickets) =>
              new featureActions.LoadTicketsSuccessAction({ tickets })
          ),
          catchError((error) =>
            observableOf(
              new featureActions.LoadTicketsFailureAction({
                error: transformError(error),
              })
            )
          )
        )
      )
    )
  );

  createTicketEffect$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.CreateTicketAction>(
        featureActions.ActionTypes.CREATE_TICKET
      ),
      map((action) => action.payload),
      concatMap(({ newTicket }) =>
        this.ticketService.ticketsControllerCreate({ body: newTicket }).pipe(
          map(
            (ticket) => new featureActions.CreateTicketSuccessAction({ ticket })
          ),
          catchError((error) =>
            observableOf(
              new featureActions.CreateTicketFailureAction({
                error: transformError(error),
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
                  error: transformError(error),
                })
              )
            )
          )
      )
    )
  );
}
