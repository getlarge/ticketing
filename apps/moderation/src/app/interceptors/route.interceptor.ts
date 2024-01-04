import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export class RouteInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    Logger.log('Route interceptor pre-request');
    return next.handle().pipe(
      tap(() => {
        Logger.log('Route interceptor post-request');
      }),
    );
  }
}
