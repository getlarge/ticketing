import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export class ControllerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    Logger.log('Controller interceptor pre-request');
    return next.handle().pipe(
      tap(() => {
        Logger.log('Controller interceptor post-request');
      }),
    );
  }
}
