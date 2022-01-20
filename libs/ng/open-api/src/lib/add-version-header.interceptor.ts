import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Environment, VersioningType } from '@ticketing/ng/env';
import { VERSION_HEADER_NAME } from '@ticketing/shared/constants';
import { Observable } from 'rxjs';

export class AddVersionHeaderInterceptor implements HttpInterceptor {
  constructor(private environment: Environment) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const { apiVersion, versioningType } = this.environment;
    if (versioningType === VersioningType.HEADER) {
      const clonedRequest = req.clone({ headers: req.headers.append(VERSION_HEADER_NAME, apiVersion) });
      return next.handle(clonedRequest);
    }
    return next.handle(req);
  }
}
