import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
} from '@ticketing/microservices/shared/events';
import { Model } from 'mongoose';

import { Order } from './models';
import { Order as OrderSchema, OrderDocument } from './schemas';

@Injectable()
export class OrdersService {
  readonly logger = new Logger(OrdersService.name);
  readonly expirationWindow: number;

  constructor(
    @InjectModel(OrderSchema.name) private orderModel: Model<OrderDocument>
  ) {}

  async create(orderEvent: OrderCreatedEvent['data']): Promise<Order> {
    const { id, status, ticket, version, userId } = orderEvent;
    const newOrder = await this.orderModel.create({
      _id: id,
      status,
      price: ticket.price,
      version,
      userId,
    });
    return newOrder.toJSON<Order>();
  }

  async cancel(orderEvent: OrderCancelledEvent['data']): Promise<Order> {
    const { id, status, version } = orderEvent;
    const order = await this.orderModel.findOne({
      _id: id,
      version: version - 1,
    });
    if (!order) {
      throw new NotFoundException(
        `order with ${id} and version ${version - 1} not found`
      );
    }
    order.set({ status });
    await order.save();
    return order.toJSON<Order>();
  }
}
