import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '@ticketing/ng/env';
import { AUTHORIZATION_HEADER_NAME } from '@ticketing/shared/constants';
import { Observable, switchMap, take } from 'rxjs';

import { UserStoreSelectors, UserStoreState } from '../store';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private store: Store<UserStoreState.State>) {}

  // add auth header with jwt if user is logged in and request is to the api url
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    //? Take token from LocalStorageService.get('token') instead ?
    return this.store.select(UserStoreSelectors.selectCurrentToken).pipe(
      take(1),
      switchMap((token) => {
        // eslint-disable-next-line no-param-reassign
        request = this.updateRequest(request, token);
        return next.handle(request);
      })
    );
  }

  updateRequest(
    request: HttpRequest<unknown>,
    token?: string
  ): HttpRequest<unknown> {
    const url = new URL(request.url);
    const isApiUrl = url.host === environment.apiBaseDomain;
    if (token && isApiUrl) {
      return request.clone({
        setHeaders: {
          [AUTHORIZATION_HEADER_NAME]: `Bearer ${token}`,
        },
      });
    }
    return request;
  }
}
