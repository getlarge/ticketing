import { OryError } from '@getlarge/kratos-client-wrapper';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { ErrorResponse, GenericError } from '@ticketing/shared/errors';
import type { AxiosError } from 'axios';
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
    const status = this.getStatus(exception);
    const errorResponse = this.getErrorResponse(exception, request.url);
    return response.status(status).send(errorResponse);
  }

  private handleRpcException(
    exception: unknown,
    host: ArgumentsHost,
  ): Observable<ErrorResponse> {
    const ctx = host.switchToRpc().getContext<RmqContext>();
    const pattern = ctx.getPattern();
    const errorResponse = this.getErrorResponse(exception, pattern);
    return throwError(() => errorResponse);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof GenericError) {
      return exception.statusCode;
    }
    if (exception instanceof OryError) {
      return exception.statusCode;
    }
    if (exception['isAxiosError']) {
      return (exception as AxiosError).response?.status || 500;
    }
    if (exception instanceof Error) {
      return 500;
    }
  }

  private getMessage(exception: unknown): string {
    if (exception instanceof OryError) {
      return exception.message;
    }
    if (exception['isAxiosError']) {
      return (
        (exception as AxiosError)?.cause?.message ??
        (exception as AxiosError).message
      );
    }
    if (exception instanceof Error) {
      return exception.message;
    }
    return 'Unknown error';
  }

  private getErrorResponse(exception: unknown, path?: string): ErrorResponse {
    if (exception instanceof GenericError) {
      return exception.toErrorResponse();
    }
    return new ErrorResponse({
      name: 'UnknownError',
      statusCode: this.getStatus(exception),
      errors: [{ message: this.getMessage(exception) }],
      details: {},
      path,
    });
  }
}
