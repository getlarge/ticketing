import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Publisher } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  Patterns,
  PaymentCreatedEvent,
} from '@ticketing/microservices/shared/events';
import { User } from '@ticketing/shared/models';
import { isEmpty } from 'lodash';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';

import { AppConfigService } from '../env';
import { Ticket as TicketSchema, TicketDocument } from '../tickets/schemas';
import { CreateOrder, Order, OrderStatus } from './models';
import { Order as OrderSchema, OrderDocument } from './schemas';

@Injectable()
export class OrdersService {
  readonly logger = new Logger(OrdersService.name);
  readonly expirationWindow: number;

  constructor(
    @InjectModel(OrderSchema.name) private orderModel: Model<OrderDocument>,
    @InjectModel(TicketSchema.name) private ticketModel: Model<TicketDocument>,
    @Inject(ConfigService) private configService: AppConfigService,
    @Inject(Publisher) private publisher: Publisher
  ) {
    this.expirationWindow = this.configService.get(
      'EXPIRATION_WINDOW_SECONDS',
      { infer: true }
    );
  }

  emitEvent(
    pattern: Patterns.OrderCreated | Patterns.OrderCancelled,
    event: OrderCreatedEvent['data'] | OrderCancelledEvent['data']
  ): Observable<string> {
    return this.publisher.emit<string, typeof event>(pattern, event);
  }

  async create(orderRequest: CreateOrder, currentUser: User): Promise<Order> {
    // 1. find the ticket
    const { ticketId } = orderRequest;
    const ticket = await this.ticketModel.findOne({ _id: ticketId });
    if (!ticket) {
      throw new NotFoundException(`Ticket ${ticketId} not found`);
    }
    // 2. check if ticket is not already ordered
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestException(`Ticket ${ticketId} is already reserved`);
    }
    // 3. Calclate expiration date
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.expirationWindow);
    // 4. Build the order and save it to DB
    const newOrder = await this.orderModel.create({
      ticket,
      userId: currentUser.id,
      expiresAt,
      status: OrderStatus.Created,
    });
    await newOrder.populate('ticket');
    const result = newOrder.toJSON<Order>();
    // 5. Publish an event
    this.emitEvent(Patterns.OrderCreated, result);
    return result;
  }

  async find(currentUser: User): Promise<Order[]> {
    const orders = await this.orderModel
      .find({ userId: currentUser.id })
      .populate('ticket');
    return orders?.length ? orders.map((order) => order.toJSON<Order>()) : [];
  }

  orderExists(id: string, order: OrderDocument): void {
    if (isEmpty(order)) {
      throw new NotFoundException(`Order ${id} not found`);
    }
  }

  userIsOrderOwner(currentUser: User, order: OrderDocument): void {
    if (order.userId !== currentUser.id) {
      throw new ForbiddenException(
        `Order ${order._id} does not belong to user ${currentUser.id}`
      );
    }
  }

  async findById(id: string, currentUser: User): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: id }).populate('ticket');
    this.orderExists(id, order);
    this.userIsOrderOwner(currentUser, order);
    if (order.userId !== currentUser.id) {
      throw new ForbiddenException(
        `Order ${id} does not belong to user ${currentUser.id}`
      );
    }
    return order.toJSON<Order>();
  }

  async cancelById(id: string, currentUser: User): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: id }).populate('ticket');
    this.orderExists(id, order);
    this.userIsOrderOwner(currentUser, order);
    order.set({ status: OrderStatus.Cancelled });
    await order.save();
    const result = order.toJSON<Order>();
    this.emitEvent(Patterns.OrderCancelled, result);
    return result;
  }

  async expireById(id: string): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: id }).populate('ticket');
    this.orderExists(id, order);
    if (order.status === OrderStatus.Complete) {
      return order.toJSON<Order>();
    }
    order.set({ status: OrderStatus.Cancelled });
    await order.save();
    const result = order.toJSON<Order>();
    this.emitEvent(Patterns.OrderCancelled, result);
    return result;
  }

  async complete(data: PaymentCreatedEvent['data']): Promise<Order> {
    const { orderId } = data;
    const order = await this.orderModel.findOne({ _id: orderId });
    this.orderExists(orderId, order);
    order.set({ status: OrderStatus.Complete });
    await order.save();
    const result = order.toJSON<Order>();
    //? TODO: this.emitEvent(Patterns.OrderComplete, result);
    return result;
  }
}
