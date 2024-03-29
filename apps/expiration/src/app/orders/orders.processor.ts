import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ExpirationCompletedEvent,
  Patterns,
} from '@ticketing/microservices/shared/events';
import { Order } from '@ticketing/shared/models';
import { Job } from 'bull';
import { lastValueFrom } from 'rxjs';

import {
  ORDERS_CLIENT,
  ORDERS_EXPIRATION_JOB,
  ORDERS_QUEUE,
} from '../shared/constants';

export type OrdersProcessorData = Pick<Order, 'id' | 'expiresAt'>;

@Processor(ORDERS_QUEUE)
export class OrdersProcessor {
  readonly logger = new Logger(OrdersProcessor.name);

  constructor(@Inject(ORDERS_CLIENT) private client: ClientProxy) {}

  @Process(ORDERS_EXPIRATION_JOB)
  async expireOrder(job: Job<OrdersProcessorData>): Promise<void> {
    const { data } = job;
    this.logger.debug(`Expire order ${data.id}`);
    await lastValueFrom(
      this.client.emit<
        ExpirationCompletedEvent['name'],
        ExpirationCompletedEvent['data']
      >(Patterns.ExpirationCompleted, data),
    );
  }

  @OnQueueCompleted({ name: ORDERS_EXPIRATION_JOB })
  onCompleted(job: Job): void {
    this.logger.log(`Processing job ${job.id} of type ${job.name} is done`);
  }

  @OnQueueFailed({ name: ORDERS_EXPIRATION_JOB })
  onFailed(job: Job, error: Error): void {
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} has failed with error ${error.message}`,
    );
  }
}
