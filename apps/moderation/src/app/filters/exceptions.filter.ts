import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { ErrorResponse, GenericError } from '@ticketing/shared/errors';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Observable, throwError } from 'rxjs';

@Catch()
export class GenericExceptionFilter<T = unknown> implements ExceptionFilter<T> {
  catch(
    exception: unknown,
    host: ArgumentsHost,
  ): FastifyReply | Observable<ErrorResponse> {
    const type = host.getType();
    if (type === 'http') {
      return this.handleHttpException(exception, host);
    } else if (type === 'rpc') {
      return this.handleRpcException(exception, host);
    }
    throw exception;
  }

  private handleHttpException(
    exception: unknown,
    host: ArgumentsHost,
  ): FastifyReply {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status =
      exception instanceof GenericError ? exception.statusCode : 500;
    const errorResponse =
      exception instanceof GenericError
        ? exception.toErrorResponse()
        : new ErrorResponse({
            name: 'UnknownError',
            statusCode: status,
            errors: [{ message: exception?.toString() ?? 'Unknown error' }],
            details: {},
            path: request.url,
          });
    return response.status(status).send(errorResponse);
  }

  private handleRpcException(
    exception: unknown,
    host: ArgumentsHost,
  ): Observable<ErrorResponse> {
    const ctx = host.switchToRpc().getContext<RmqContext>();
    const pattern = ctx.getPattern();
    const status =
      exception instanceof GenericError ? exception.statusCode : 400;
    const errorResponse =
      exception instanceof GenericError
        ? exception.toErrorResponse()
        : new ErrorResponse({
            name: 'UnknownError',
            statusCode: status,
            errors: [{ message: exception?.toString() ?? 'Unknown error' }],
            details: {},
            path: pattern,
          });
    return throwError(() => errorResponse);
  }
}
