import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import type { FastifyReply } from 'fastify';

@Catch()
export class RouteFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    Logger.log('Route filter');
    const context = host.switchToHttp();
    const response = context.getResponse<FastifyReply>();
    void response.status(500).send(exception);
  }
}
