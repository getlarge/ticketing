import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { RootStoreState } from '../store';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private store: Store<RootStoreState.RootState>) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err.status === 401) {
          // auto logout if 401 response returned from api
          // this.store.dispatch(new UserStoreActions.SignOutAction());
        }

        // const error = err.error.message || err.statusText;
        return throwError(() => err.error || err);
      })
    );
  }
}
