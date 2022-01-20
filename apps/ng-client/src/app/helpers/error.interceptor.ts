import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UserStateService } from '../services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private userService: UserStateService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err.status === 401) {
          // auto logout if 401 response returned from api
          this.userService.logout();
        }

        const error = err.error.message || err.statusText;
        return throwError(() => error);
      })
    );
  }
}
