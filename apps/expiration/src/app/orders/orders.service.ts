import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
} from '@ticketing/microservices/shared/events';
import { Queue } from 'bull';

import { ORDERS_EXPIRATION_JOB, ORDERS_QUEUE } from '../shared/constants';
import { OrdersProcessorData } from './orders.processor';

@Injectable()
export class OrderService {
  constructor(
    @InjectQueue(ORDERS_QUEUE)
    private expirationQueue: Queue<OrdersProcessorData>
  ) {}

  async createJob(order: OrderCreatedEvent['data']): Promise<void> {
    const jobId = `queue.${ORDERS_QUEUE}.${order.id}`;
    this.expirationQueue.getJob;
    const job = await this.expirationQueue.getJob(jobId);
    if (job) {
      // job already created
      return;
    }

    const delay = new Date(order.expiresAt).getTime() - new Date().getTime();
    await this.expirationQueue.add(ORDERS_EXPIRATION_JOB, order, {
      jobId,
      delay,
    });
  }

  async cancelJob(order: OrderCancelledEvent['data']): Promise<void> {
    const jobId = `queue.${ORDERS_QUEUE}.${order.id}`;
    const job = await this.expirationQueue.getJob(jobId);
    if (!job) {
      // job already deleted
      return;
    }
    await job.remove();
  }
}
