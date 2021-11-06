import { Catch, HttpStatus, Logger } from '@nestjs/common';
import { ArgumentsHost, ExceptionFilter } from '@nestjs/common/interfaces';
import { ErrorResponse, isCustomError } from '@ticketing/shared/errors';
import type { Request, Response } from 'express';

@Catch()
export class HttpErrorFilter<T = unknown> implements ExceptionFilter<T> {
  protected logger = new Logger(HttpErrorFilter.name);

  catch(exception: T, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status = this.getExceptionStatus(exception);
    const message = this.getExceptionMessage(exception);
    const errorResponse: ErrorResponse = {
      statusCode: status,
      path: request.url,
      errors: message,
      timestamp: new Date().toISOString(),
    };
    this.logger.error(errorResponse);
    if (response.headersSent) {
      return;
    }
    response.status(status).json(errorResponse);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getExceptionStatus(exception: any): HttpStatus {
    if (isCustomError(exception)) {
      return exception.statusCode;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getExceptionMessage(exception: any): { message: string; field?: string }[] {
    if (isCustomError(exception)) {
      return exception.serializeErrors();
    } else if (Object.prototype.hasOwnProperty.call(exception, 'message')) {
      return [{ message: exception.message }];
    }
    return [{ message: 'Internal Server Error' }];
  }
}
