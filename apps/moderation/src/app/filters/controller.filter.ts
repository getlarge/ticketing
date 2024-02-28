import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';

@Catch()
export class ControllerFilter implements ExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch(exception: unknown, _host: ArgumentsHost): void {
    Logger.log('Controller filter');
    throw exception;
  }
}
