import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common/interfaces';
import { RmqContext, RpcException } from '@nestjs/microservices';
import {
  ErrorResponse,
  isCustomError,
  isErrorResponse,
} from '@ticketing/shared/errors';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Observable, throwError } from 'rxjs';

function isHttpException(error: unknown): error is HttpException {
  return (
    error instanceof HttpException ||
    (typeof error === 'object' &&
      'getStatus' in error &&
      typeof error?.getStatus === 'function' &&
      'getResponse' in error &&
      typeof error?.getResponse === 'function')
  );
}

function isRpcException(error: unknown): error is RpcException {
  return (
    error instanceof RpcException ||
    (typeof error === 'object' &&
      'getError' in error &&
      typeof error?.getError === 'function')
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
    this.logger.error(exception);
    const context = host.switchToHttp();
    const response = context.getResponse<FastifyReply>();
    const request = context.getRequest<FastifyRequest>();
    const status = this.getExceptionStatus(exception);
    const message = this.getExceptionMessage(exception);
    const details = this.getExceptionDetails(exception);
    const errorResponse = new ErrorResponse({
      statusCode: status,
      path: request.url,
      errors: message,
      timestamp: new Date().toISOString(),
      details,
    });
    this.logger.warn(errorResponse);
    if (response.sent) {
      return;
    }
    void response.status(status).send(errorResponse);
  }

  catchRpcError(exception: T, host: ArgumentsHost): Observable<R> {
    this.logger.error(exception);
    const context = host.switchToRpc();
    const ctx = context.getContext<RmqContext>();
    const pattern = ctx.getPattern();
    const status = this.getExceptionStatus(exception);
    const message = this.getExceptionMessage(exception);
    const details = this.getExceptionDetails(exception);
    const errorResponse = new ErrorResponse({
      statusCode: status,
      path: pattern,
      errors: message,
      timestamp: new Date().toISOString(),
      details,
    });
    this.logger.warn(errorResponse);
    return throwError(() => errorResponse);
  }

  // TODO: handle OryError

  getExceptionStatus(exception: T): HttpStatus {
    if (isCustomError(exception) || isErrorResponse(exception)) {
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
    } else if (isErrorResponse(exception)) {
      return exception.errors;
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
    } else if (isErrorResponse(exception) || hasDetailsProperty(exception)) {
      return exception.details;
    }
    return null;
  }
}
