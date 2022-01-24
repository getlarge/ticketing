import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '@ticketing/ng/env';
import { AUTHORIZATION_HEADER_NAME } from '@ticketing/shared/constants';
import { Observable, Subject, switchMap, takeUntil } from 'rxjs';

import { RootStoreState } from '../store';

@Injectable()
export class JwtInterceptor implements HttpInterceptor, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store<RootStoreState.RootState>) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // add auth header with jwt if user is logged in and request is to the api url
    return this.store
      .select((st) => st.users?.currentToken)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((token) => {
          const isApiUrl = request.url.startsWith(environment.apiBaseDomain);
          if (token && isApiUrl) {
            // eslint-disable-next-line no-param-reassign
            request = request.clone({
              setHeaders: {
                [AUTHORIZATION_HEADER_NAME]: `Bearer ${token}`,
              },
            });
          }
          return next.handle(request);
        })
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
