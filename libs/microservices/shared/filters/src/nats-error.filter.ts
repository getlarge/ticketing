import { Catch, HttpStatus, Logger, RpcExceptionFilter } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common/interfaces';
import { RpcException } from '@nestjs/microservices';
import { NatsStreamingContext } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { ErrorResponse, isCustomError } from '@ticketing/shared/errors';
import { Observable, throwError } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRpcException(error: any): error is RpcException {
  return (
    error instanceof RpcException ||
    (typeof error === 'object' && typeof error?.getError === 'function')
  );
}

@Catch()
export class NatsStreamErrorFilter<T = unknown, R = unknown>
  implements RpcExceptionFilter<T, R>
{
  protected logger = new Logger(NatsStreamErrorFilter.name);

  catch(exception: T, host: ArgumentsHost): Observable<R> {
    const context = host.switchToRpc();
    const ctx = context.getContext<NatsStreamingContext>();
    const channel = ctx.message.getSubject();
    const status = this.getExceptionStatus(exception);
    const message = this.getExceptionMessage(exception);
    const errorResponse: ErrorResponse = {
      statusCode: status,
      path: channel,
      errors: message,
      timestamp: new Date().toISOString(),
    };
    this.logger.error(errorResponse);

    return throwError(() => errorResponse);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getExceptionStatus(exception: any): number {
    if (isCustomError(exception)) {
      return exception.statusCode;
    } else if (isRpcException(exception)) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getExceptionMessage(exception: any): { message: string; field?: string }[] {
    if (isCustomError(exception)) {
      return exception.serializeErrors();
    } else if (isRpcException(exception)) {
      return [{ message: exception.message }];
    } else if (Object.prototype.hasOwnProperty.call(exception, 'message')) {
      return [{ message: exception.message }];
    }
    return [{ message: 'Internal Server Error' }];
  }
}
