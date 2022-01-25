import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UsersService } from '@ticketing/ng/open-api';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';

import { LocalStorageService } from '../../services';
import { transformError } from '../../utils/serialize-error';
import * as featureActions from './actions';

@Injectable()
export class UserStoreEffects {
  constructor(private actions$: Actions, private userService: UsersService) {}

  signUpEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.SignUpAction>(featureActions.ActionTypes.SIGN_UP),
      map((action) => action.payload),
      exhaustMap(({ credentials }) =>
        this.userService.usersControllerSignUp({ body: credentials }).pipe(
          map((user) => new featureActions.SignUpSuccessAction({ user })),
          catchError((error) =>
            of(
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
      exhaustMap(({ credentials }) =>
        this.userService.usersControllerSignIn({ body: credentials }).pipe(
          map(({ token }) => {
            LocalStorageService.set('token', token);
            return new featureActions.SignInSuccessAction({ token });
          }),
          catchError((error) =>
            of(
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
      exhaustMap(() =>
        this.userService.usersControllerSignOut().pipe(
          map(() => {
            LocalStorageService.remove('token');
            LocalStorageService.remove('user');
            return new featureActions.SignOutSuccessAction();
          }),
          catchError((error) => {
            LocalStorageService.remove('token');
            LocalStorageService.remove('user');
            return of(
              new featureActions.SignOutFailureAction({
                error: transformError(error),
              })
            );
          })
        )
      )
    )
  );

  loadCurrentUserEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.LoadCurrentUserAction>(
        featureActions.ActionTypes.LOAD_CURRENT_USER
      ),
      exhaustMap(() =>
        this.userService.usersControllerGetCurrentUser().pipe(
          map((user) => {
            LocalStorageService.setObject('user', user);
            return new featureActions.LoadCurrentUserSuccessAction({ user });
          }),
          catchError((error) =>
            of(
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
