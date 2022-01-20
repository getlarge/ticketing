import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@ticketing/ng/env';
import { Observable } from 'rxjs';

import { UserStateService } from '../services';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private userService: UserStateService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // add auth header with jwt if user is logged in and request is to the api url
    const token = this.userService.tokenValue;
    const isApiUrl = request.url.startsWith(environment.apiBaseDomain);
    if (token && isApiUrl) {
      // eslint-disable-next-line no-param-reassign
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next.handle(request);
  }
}
