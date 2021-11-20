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
import { User } from '@ticketing/shared/models';
import { isEmpty } from 'lodash';
import { Model } from 'mongoose';

import { AppConfigService } from '../env';
import { CreateOrder, Order, OrderStatus } from './models';
import {
  Order as OrderSchema,
  OrderDocument,
  Ticket as TicketSchema,
  TicketDocument,
} from './schemas';

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

  async create(orderRequest: CreateOrder, currentUser: User): Promise<Order> {
    // 1. find the ticket
    const { ticketId } = orderRequest;
    const ticket = await this.ticketModel.findById(ticketId);
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
    const result = newOrder.toJSON<Order>();

    // 5. Publish an event
    // this.publisher
    //   .emit<TicketCreatedEvent['name'], TicketCreatedEvent['data']>(
    //     Patterns.TicketCreated,
    //     result
    //   )
    //   .subscribe({
    //     next: (value) =>
    //       this.logger.log(`Sent event ${Patterns.TicketCreated} ${value}`),
    //   });
    return result;
  }

  async find(currentUser: User): Promise<Order[]> {
    const orders = (await this.orderModel.find()) || [];
    return orders.map((order) => order.toJSON<Order>());
  }

  async findById(id: string, currentUser: User): Promise<Order> {
    const ticket = await this.orderModel.findOne({ _id: id });
    if (isEmpty(ticket)) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return ticket.toJSON<Order>();
  }

  async deleteById(id: string, currenUser: User): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: id });
    if (isEmpty(order)) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    if (order.userId !== currenUser.id) {
      throw new ForbiddenException();
    }

    await order.delete();
    const result = order.toJSON<Order>();
    // this.publisher.emit<TicketUpdatedEvent['name'], TicketUpdatedEvent['data']>(
    //   Patterns.TicketUpdated,
    //   result
    // );
    return result;
  }
}
