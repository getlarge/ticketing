import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ArgumentsHost, ExceptionFilter } from '@nestjs/common/interfaces';
import { ErrorResponse, isCustomError } from '@ticketing/shared/errors';
import type { FastifyReply, FastifyRequest } from 'fastify';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isHttpException(error: any): error is HttpException {
  return (
    error instanceof HttpException ||
    (typeof error === 'object' &&
      typeof error?.getStatus === 'function' &&
      typeof error?.getResponse === 'function')
  );
}

@Catch()
export class HttpErrorFilter<T = unknown> implements ExceptionFilter<T> {
  protected logger = new Logger(HttpErrorFilter.name);

  catch(exception: T, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<FastifyReply>();
    const request = context.getRequest<FastifyRequest>();
    const status = this.getExceptionStatus(exception);
    const message = this.getExceptionMessage(exception);
    const errorResponse: ErrorResponse = {
      statusCode: status,
      path: request.url,
      errors: message,
      timestamp: new Date().toISOString(),
    };
    this.logger.error(errorResponse);
    if (response.sent) {
      return;
    }
    response.status(status).send(errorResponse);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getExceptionStatus(exception: any): HttpStatus {
    if (isCustomError(exception)) {
      return exception.statusCode;
    } else if (isHttpException(exception)) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getExceptionMessage(exception: any): { message: string; field?: string }[] {
    if (isCustomError(exception)) {
      return exception.serializeErrors();
    } else if (isHttpException(exception)) {
      return [{ message: exception.message }];
    } else if (Object.prototype.hasOwnProperty.call(exception, 'message')) {
      return [{ message: exception.message }];
    }
    return [{ message: 'Internal Server Error' }];
  }
}
