import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UsersService } from '@ticketing/ng/open-api';
import { of as observableOf } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';

import { transformError } from '../../utils/serialize-error';
import * as featureActions from './actions';

@Injectable()
export class UserStoreEffects {
  constructor(private actions$: Actions, private userService: UsersService) {}

  signUpEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.SignUpAction>(featureActions.ActionTypes.SIGN_UP),
      map((action) => action.payload),
      concatMap(({ credentials }) =>
        this.userService.usersControllerSignUp({ body: credentials }).pipe(
          map((user) => new featureActions.SignUpSuccessAction({ user })),
          catchError((error) =>
            observableOf(
              new featureActions.SignUpFailureAction({
                error: transformError(error),
              })
            )
          )
        )
      )
    )
  );

  signInEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.SignInAction>(featureActions.ActionTypes.SIGN_IN),
      map((action) => action.payload),
      concatMap(({ credentials }) =>
        this.userService.usersControllerSignIn({ body: credentials }).pipe(
          map(({ token }) => new featureActions.SignInSuccessAction({ token })),
          catchError((error) =>
            observableOf(
              new featureActions.SignInFailureAction({
                error: transformError(error),
              })
            )
          )
        )
      )
    )
  );

  signOutEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.LoadCurrentUserAction>(
        featureActions.ActionTypes.SIGN_OUT
      ),
      switchMap(() =>
        this.userService.usersControllerSignOut().pipe(
          map(() => new featureActions.SignOutSuccessAction()),
          catchError((error) =>
            observableOf(
              new featureActions.SignOutFailureAction({
                error: transformError(error),
              })
            )
          )
        )
      )
    )
  );

  loadCurrentUserEffect$ = createEffect(() =>
    this.actions$.pipe(
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
                error: transformError(error),
              })
            )
          )
        )
      )
    )
  );
}
