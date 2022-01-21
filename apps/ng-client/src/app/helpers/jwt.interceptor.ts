import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { State } from '@ngrx/store';
import { environment } from '@ticketing/ng/env';
import { AUTHORIZATION_HEADER_NAME } from '@ticketing/shared/constants';
import { Observable } from 'rxjs';

import { RootStoreState } from '../store';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private state: State<RootStoreState.RootState>) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // add auth header with jwt if user is logged in and request is to the api url
    const currentState = this.state.getValue() as RootStoreState.RootState;
    const token = currentState?.users?.currentToken;
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
  }
}
