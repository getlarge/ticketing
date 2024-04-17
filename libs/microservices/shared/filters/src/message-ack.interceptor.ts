import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class MessageAckInterceptor implements NestInterceptor {
  readonly logger = new Logger(MessageAckInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }
    const ctx = context.switchToRpc().getContext<RmqContext>();
    const channel = ctx.getChannelRef() as Channel;
    const message = ctx.getMessage() as Message;
    this.logger.debug(`received message on ${ctx.getPattern()}`);
    return next.handle().pipe(
      tap({
        next: () => {
          channel.ack(message);
        },
        error: () => {
          // TODO: requeue when error is timeout or connection error
          channel.nack(message, false, false);
        },
      }),
    );
  }
}
