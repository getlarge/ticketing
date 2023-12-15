import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Session } from '@ory/client';
import { UserDto, UsersService } from '@ticketing/ng/open-api';
import { Observable, of } from 'rxjs';
import {
  catchError,
  exhaustMap,
  map,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';

import { LocalStorageService, OryClientService } from '../../services';
import { transformError } from '../../utils/serialize-error';
import * as featureActions from './actions';

type ValidSession = Session & {
  identity: { metadata_public: { id: string } };
};

@Injectable()
export class UserStoreEffects {
  constructor(
    private actions$: Actions,
    private userService: UsersService,
    private oryClientService: OryClientService,
  ) {}

  private isValidSession(x: Session): x is ValidSession {
    return (
      !!x?.identity &&
      typeof x.identity.traits === 'object' &&
      !!x.identity.traits &&
      'email' in x.identity.traits &&
      typeof x.identity.metadata_public === 'object' &&
      !!x.identity.metadata_public &&
      'id' in x.identity.metadata_public &&
      typeof x.identity.metadata_public.id === 'string'
    );
  }

  private getUserFromSession(session: ValidSession): UserDto {
    return {
      identityId: session?.identity.id,
      id: session?.identity.metadata_public?.id,
      email: session?.identity.traits.email,
    };
  }

  /**
   * @deprecated Account creation is now handled by the Ory self-service UI
   */
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
              }),
            ),
          ),
        ),
      ),
    ),
  );

  /**
   * @deprecated Login is now handled by the Ory self-service UI
   */
  signInEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.SignInAction>(featureActions.ActionTypes.SIGN_IN),
      switchMap(() => {
        return this.oryClientService.toSession().pipe(
          withLatestFrom(this.oryClientService.createBrowserLogoutFlow()),
          switchMap(([session, logoutFlow]) => {
            if (!this.isValidSession(session)) {
              return this.oryClientService.disableSession(session.id).pipe(
                // eslint-disable-next-line max-nested-callbacks
                switchMap(() => {
                  return of(
                    new featureActions.SignInFailureAction({
                      error: transformError(new Error('Session is invalid')),
                    }),
                  );
                }),
              );
            }
            LocalStorageService.setObject(
              'user',
              this.getUserFromSession(session),
            );
            LocalStorageService.set('logoutUrl', logoutFlow.logout_url);
            LocalStorageService.setObject('session', session);
            return of(
              new featureActions.SignInSuccessAction({
                token: '',
                logoutUrl: logoutFlow.logout_url,
                session,
              }),
            );
          }),
          catchError((error) => {
            console.error(error);
            window.location.replace(
              `${this.oryClientService.basePath}/ui/login`,
            );
            return of(
              new featureActions.SignInFailureAction({
                error: transformError(error),
              }),
            );
          }),
        );
      }),
    ),
  );

  signInSuccessEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.SignInSuccessAction>(
        featureActions.ActionTypes.SIGN_IN_SUCCESS,
      ),
      map(() => {
        return new featureActions.LoadCurrentUserAction();
      }),
    ),
  );

  signOutEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.SignOutAction>(featureActions.ActionTypes.SIGN_OUT),
      exhaustMap(() => {
        return new Observable((observer) => {
          const logoutUrl = LocalStorageService.get('logoutUrl');
          if (logoutUrl) {
            window.location.replace(logoutUrl);
            observer.next();
          } else {
            observer.error('Logout url not found');
          }
        }).pipe(
          map(() => {
            LocalStorageService.remove('user');
            LocalStorageService.remove('session');
            LocalStorageService.remove('logoutUrl');
            return new featureActions.SignOutSuccessAction();
          }),
          catchError((error) => {
            LocalStorageService.remove('user');
            LocalStorageService.remove('logoutUrl');
            return of(
              new featureActions.SignOutFailureAction({
                error: transformError(error),
              }),
            );
          }),
        );
      }),
    ),
  );

  loadCurrentUserEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.LoadCurrentUserAction>(
        featureActions.ActionTypes.LOAD_CURRENT_USER,
      ),
      exhaustMap(() => {
        return new Observable<UserDto>((observer) => {
          const session = LocalStorageService.getObject('session') as Session;
          if (!this.isValidSession(session)) {
            observer.error('Session not found');
          } else {
            observer.next(this.getUserFromSession(session));
          }
        }).pipe(
          map((user) => {
            LocalStorageService.setObject('user', user);
            return new featureActions.LoadCurrentUserSuccessAction({ user });
          }),
          catchError(() => {
            return this.oryClientService.getSession().pipe(
              map(({ session, logoutFlow }) => {
                LocalStorageService.set('logoutUrl', logoutFlow.logout_url);
                LocalStorageService.setObject('session', session);
                if (!this.isValidSession(session)) {
                  throw new Error('Session not found');
                }
                const user = this.getUserFromSession(session);
                LocalStorageService.setObject('user', user);
                return new featureActions.LoadCurrentUserSuccessAction({
                  user,
                });
              }),
              catchError((err) =>
                of(
                  new featureActions.LoadCurrentUserFailureAction({
                    error: transformError(err),
                  }),
                ),
              ),
            );
          }),
        );
      }),
    ),
  );
}
