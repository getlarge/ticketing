import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export class GlobalInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<unknown> | Promise<Observable<unknown>> {
    Logger.log('Global interceptor pre-request');
    return next.handle().pipe(
      tap(() => {
        Logger.log('Global interceptor post-request');
      })
    );
  }
}
