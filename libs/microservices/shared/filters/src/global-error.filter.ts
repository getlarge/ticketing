import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common/interfaces';
import { RpcException } from '@nestjs/microservices';
import { NatsStreamingContext } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { ErrorResponse, isCustomError } from '@ticketing/shared/errors';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Observable, throwError } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isHttpException(error: any): error is HttpException {
  return (
    error instanceof HttpException ||
    (typeof error === 'object' &&
      typeof error?.getStatus === 'function' &&
      typeof error?.getResponse === 'function')
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRpcException(error: any): error is RpcException {
  return (
    error instanceof RpcException ||
    (typeof error === 'object' && typeof error?.getError === 'function')
  );
}

function hasMessageProperty(error: unknown): error is { message: string } {
  return typeof error === 'object' && 'message' in error;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasDetailsProperty(error: unknown): error is { details: any } {
  return typeof error === 'object' && 'details' in error;
}

@Catch()
export class GlobalErrorFilter<T = unknown, R = unknown> {
  protected logger = new Logger(GlobalErrorFilter.name);

  catch(exception: T, host: ArgumentsHost): void | Observable<R> {
    const contextType = host.getType();
    if (contextType === 'http') {
      return this.catchHttpError(exception, host);
    } else if (contextType === 'rpc') {
      return this.catchRpcError(exception, host);
    }
  }

  catchHttpError(exception: T, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<FastifyReply>();
    const request = context.getRequest<FastifyRequest>();
    const status = this.getExceptionStatus(exception);
    const message = this.getExceptionMessage(exception);
    const details = this.getExceptionDetails(exception);
    const errorResponse: ErrorResponse = {
      statusCode: status,
      path: request.url,
      errors: message,
      timestamp: new Date().toISOString(),
      details,
    };
    this.logger.error(errorResponse);
    if (response.sent) {
      return;
    }
    response.status(status).send(errorResponse);
  }

  catchRpcError(exception: T, host: ArgumentsHost): Observable<R> {
    const context = host.switchToRpc();
    const ctx = context.getContext<NatsStreamingContext>();
    const channel = ctx.message.getSubject();
    const status = this.getExceptionStatus(exception);
    const message = this.getExceptionMessage(exception);
    const details = this.getExceptionDetails(exception);
    const errorResponse: ErrorResponse = {
      statusCode: status,
      path: channel,
      errors: message,
      timestamp: new Date().toISOString(),
      details,
    };
    this.logger.error(errorResponse);
    return throwError(() => errorResponse);
  }

  getExceptionStatus(exception: T): HttpStatus {
    if (isCustomError(exception)) {
      return exception.statusCode;
    } else if (isHttpException(exception)) {
      return exception.getStatus();
    } else if (isRpcException(exception)) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  getExceptionMessage(exception: T): { message: string; field?: string }[] {
    if (isCustomError(exception)) {
      return exception.serializeErrors();
    } else if (isHttpException(exception)) {
      return [{ message: exception.message }];
    } else if (isRpcException(exception)) {
      return [{ message: exception.message }];
    } else if (hasMessageProperty(exception)) {
      return [{ message: exception?.message }];
    }
    return [{ message: 'Internal Server Error' }];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getExceptionDetails(exception: T): any {
    if (isCustomError(exception)) {
      return exception.getDetails();
    } else if (isHttpException(exception)) {
      return exception.getResponse();
    } else if (isRpcException(exception)) {
      return exception.getError();
    } else if (hasDetailsProperty(exception)) {
      return exception.details;
    }
    return null;
  }
}
