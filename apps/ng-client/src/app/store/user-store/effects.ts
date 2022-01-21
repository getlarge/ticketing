import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { UsersService } from '@ticketing/ng/open-api';
import { of as observableOf } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';

import { serializeError } from '../../utils/serialize-error';
import * as featureActions from './actions';
import { State } from './state';

@Injectable()
export class UserStoreEffects {
  constructor(
    private actions$: Actions,
    private userService: UsersService,
    private store: Store<State>
  ) {}

  signUpEffect$ = createEffect(() => {
    return this.actions$.pipe(
      ofType<featureActions.SignUpAction>(featureActions.ActionTypes.SIGN_UP),
      map((action) => action.payload),
      concatMap(({ credentials }) =>
        this.userService.usersControllerSignUp({ body: credentials }).pipe(
          map((user) => new featureActions.SignUpSuccessAction({ user })),
          catchError((error) =>
            observableOf(
              new featureActions.SignUpFailureAction({
                error: serializeError(error).message,
              })
            )
          )
        )
      )
    );
  });

  signInEffect$ = createEffect(() => {
    return this.actions$.pipe(
      ofType<featureActions.SignInAction>(featureActions.ActionTypes.SIGN_IN),
      map((action) => action.payload),
      concatMap(({ credentials }) =>
        this.userService.usersControllerSignIn({ body: credentials }).pipe(
          map(({ token }) => new featureActions.SignInSuccessAction({ token })),
          catchError((error) =>
            observableOf(
              new featureActions.SignInFailureAction({
                error: serializeError(error).message,
              })
            )
          )
        )
      )
    );
  });

  signOutEffect$ = createEffect(() => {
    return this.actions$.pipe(
      ofType<featureActions.LoadCurrentUserAction>(
        featureActions.ActionTypes.SIGN_OUT
      ),
      switchMap(() =>
        this.userService.usersControllerSignOut().pipe(
          map(() => new featureActions.SignOutSuccessAction()),
          catchError((error) =>
            observableOf(
              new featureActions.SignOutFailureAction({
                error: serializeError(error).message,
              })
            )
          )
        )
      )
    );
  });

  loadCurrentUserEffect$ = createEffect(() => {
    return this.actions$.pipe(
      ofType<featureActions.LoadCurrentUserAction>(
        featureActions.ActionTypes.LOAD_CURRENT_USER
      ),
      switchMap(() =>
        this.userService.usersControllerGetCurrentUser().pipe(
          map(
            (user) => new featureActions.LoadCurrentUserSuccessAction({ user })
          ),
          catchError((error) =>
            observableOf(
              new featureActions.LoadCurrentUserFailureAction({
                error: serializeError(error).message,
              })
            )
          )
        )
      )
    );
  });
}
