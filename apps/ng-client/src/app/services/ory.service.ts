import { Injectable } from '@angular/core';
import {
  Configuration,
  FrontendApi,
  LoginFlow,
  LogoutFlow,
  Session,
} from '@ory/client';
import { environment } from '@ticketing/ng/env';
import { catchError, map, Observable, throwError, withLatestFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OryClientService {
  readonly client: FrontendApi;

  constructor() {
    this.client = new FrontendApi(
      new Configuration({
        basePath: this.basePath,
        baseOptions: {
          withCredentials: true,
        },
      }),
    );
  }

  get basePath(): string {
    return environment.oryBasePath;
  }

  get uiBasePath(): string {
    return environment.oryUiBasePath ?? environment.oryBasePath;
  }

  get loginPath(): string {
    return `${this.uiBasePath}/login`;
  }

  redirectToLogin(): void {
    window.location.href = this.loginPath;
  }

  createBrowserLoginFlow(): Observable<LoginFlow> {
    return new Observable((subscriber) => {
      this.client
        .createBrowserLoginFlow()
        .then((response) => subscriber.next(response.data))
        .catch((error) => subscriber.error(error));
    });
  }

  toSession(): Observable<Session> {
    return new Observable((subscriber) => {
      this.client
        .toSession()
        .then((response) => subscriber.next(response.data))
        .catch((error) => subscriber.error(error));
    });
  }

  createBrowserLogoutFlow(): Observable<LogoutFlow> {
    return new Observable((subscriber) => {
      this.client
        .createBrowserLogoutFlow()
        .then((response) => subscriber.next(response.data))
        .catch((error) => subscriber.error(error));
    });
  }

  getSession(): Observable<{ logoutFlow: LogoutFlow; session: Session }> {
    return this.toSession().pipe(
      withLatestFrom(this.createBrowserLogoutFlow()),
      map(([session, logoutFlow]) => {
        return {
          logoutFlow,
          session,
        };
      }),
      catchError((error) => {
        window.location.replace(this.loginPath);
        console.error(error);
        return throwError(() => error);
      }),
    );
  }

  disableSession(sessionId: string): Observable<boolean> {
    return new Observable((subscriber) => {
      this.client
        .disableMySession({ id: sessionId })
        .then(() => subscriber.next(true))
        .catch((error) => subscriber.error(error));
    });
  }
}
