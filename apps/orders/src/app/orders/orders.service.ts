import { OryRelationshipsService } from '@getlarge/keto-client-wrapper';
import {
  createRelationQuery,
  RelationTuple,
  relationTupleBuilder,
} from '@getlarge/keto-relations-parser';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import {
  EventsMap,
  Patterns,
  PaymentCreatedEvent,
} from '@ticketing/microservices/shared/events';
import { PermissionNamespaces } from '@ticketing/microservices/shared/models';
import { transactionManager } from '@ticketing/microservices/shared/mongo';
import { Resources } from '@ticketing/shared/constants';
import { Ticket, User } from '@ticketing/shared/models';
import { Model } from 'mongoose';
import { lastValueFrom, Observable, timeout, zip } from 'rxjs';

import type { EnvironmentVariables } from '../env';
import {
  EXPIRATION_CLIENT,
  PAYMENTS_CLIENT,
  TICKETS_CLIENT,
} from '../shared/constants';
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
    @Inject(ConfigService)
    private configService: ConfigService<EnvironmentVariables, true>,
    @Inject(OryRelationshipsService)
    private oryRelationshipsService: OryRelationshipsService,
    @Inject(TICKETS_CLIENT) private ticketsClient: ClientProxy,
    @Inject(EXPIRATION_CLIENT) private expirationClient: ClientProxy,
    @Inject(PAYMENTS_CLIENT) private paymentsClient: ClientProxy,
  ) {
    this.expirationWindow = this.configService.get(
      'EXPIRATION_WINDOW_SECONDS',
      { infer: true },
    );
  }

  private sendEvent<
    P extends Patterns.OrderCreated | Patterns.OrderCancelled,
    E extends EventsMap[P],
  >(
    pattern: P,
    event: E,
  ): Observable<[Ticket, { ok: boolean }, { ok: boolean }]> {
    return zip(
      this.ticketsClient.send(pattern, event).pipe(timeout(5000)),
      this.expirationClient.send(pattern, event).pipe(timeout(5000)),
      this.paymentsClient.send(pattern, event).pipe(timeout(5000)),
    );
  }

  private async createRelationShip(
    relationTuple: RelationTuple,
  ): Promise<void> {
    const createRelationshipBody =
      createRelationQuery(relationTuple).unwrapOrThrow();
    await this.oryRelationshipsService.createRelationship({
      createRelationshipBody,
    });
    this.logger.debug(`Created relation ${relationTuple.toString()}`);
  }

  private async deleteRelationShip(
    relationTuple: RelationTuple,
  ): Promise<void> {
    const relationshipQuery =
      createRelationQuery(relationTuple).unwrapOrThrow();
    await this.oryRelationshipsService.deleteRelationships(relationshipQuery);
    this.logger.debug(`Deleted relation ${relationTuple.toString()}`);
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

    await using manager = await transactionManager(this.ticketModel);
    const result = await manager.wrap(async (session) => {
      // 4. Build the order and save it to DB
      const res = await this.orderModel.create(
        [
          {
            ticket,
            userId: currentUser.id,
            expiresAt,
            status: OrderStatus.Created,
          },
        ],
        { session },
      );
      await res[0].populate('ticket');
      const order = res[0].toJSON<Order>();
      this.logger.debug(`Created order ${order.id}`);
      // 5. Create a relation between the ticket and the order
      const relationTupleWithTicket = relationTupleBuilder()
        .subject(PermissionNamespaces[Resources.TICKETS], ticket.id)
        .isIn('parents')
        .of(PermissionNamespaces[Resources.ORDERS], order.id);
      await this.createRelationShip(relationTupleWithTicket);
      this.logger.debug(
        `Created relation ${relationTupleWithTicket.toString()}`,
      );
      // 6. Create a relation between the user and the order
      const relationTupleWithUser = relationTupleBuilder()
        .subject(PermissionNamespaces[Resources.USERS], order.userId)
        .isIn('owners')
        .of(PermissionNamespaces[Resources.ORDERS], order.id);
      await this.createRelationShip(relationTupleWithUser);
      this.logger.debug(`Created relation ${relationTupleWithUser.toString()}`);
      // 7. Publish an event
      await lastValueFrom(this.sendEvent(Patterns.OrderCreated, order));
      this.logger.debug(`Sent event ${Patterns.OrderCreated}`);
      return order;
    });
    if (result.error) {
      this.logger.error(result.error);
      throw result.error;
    }
    return result.value;
  }

  async find(currentUser: User): Promise<Order[]> {
    const orders = await this.orderModel
      .find({ userId: currentUser.id })
      .populate('ticket');
    return orders?.length ? orders.map((order) => order.toJSON<Order>()) : [];
  }

  orderExists(id: string, order: OrderDocument): void {
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: id }).populate('ticket');
    this.orderExists(id, order);
    return order.toJSON<Order>();
  }

  async cancelById(id: string): Promise<Order> {
    await using manager = await transactionManager(this.orderModel);
    const result = await manager.wrap(async (session) => {
      const order = await this.orderModel
        .findOne({ _id: id })
        .populate('ticket')
        .session(session);
      this.orderExists(id, order);
      order.set({ status: OrderStatus.Cancelled });
      await order.save({ session });
      const updatedOrder = order.toJSON<Order>();

      const relationTuple = relationTupleBuilder()
        .subject(PermissionNamespaces[Resources.TICKETS], order.ticket.id)
        .isIn('parents')
        .of(PermissionNamespaces[Resources.ORDERS], order.id);
      await this.deleteRelationShip(relationTuple);

      await lastValueFrom(
        this.sendEvent(Patterns.OrderCancelled, updatedOrder),
      );
      return updatedOrder;
    });
    if (result.error) {
      this.logger.error(result.error);
      throw result.error;
    }
    return result.value;
  }

  async expireById(id: string): Promise<Order> {
    await using manager = await transactionManager(this.orderModel);
    const result = await manager.wrap(async (session) => {
      const order = await this.orderModel
        .findOne({ _id: id })
        .populate('ticket')
        .session(session);
      this.orderExists(id, order);
      if (order.status === OrderStatus.Complete) {
        return order.toJSON<Order>();
      }
      order.set({ status: OrderStatus.Cancelled });
      await order.save({ session });
      const updatedOrder = order.toJSON<Order>();

      const relationTuple = relationTupleBuilder()
        .subject(PermissionNamespaces[Resources.TICKETS], order.ticket.id)
        .isIn('parents')
        .of(PermissionNamespaces[Resources.ORDERS], id);
      await this.deleteRelationShip(relationTuple);

      await lastValueFrom(
        this.sendEvent(Patterns.OrderCancelled, updatedOrder),
      );
      return updatedOrder;
    });
    if (result.error) {
      this.logger.error(result.error);
      throw result.error;
    }
    return result.value;
  }

  async complete(data: PaymentCreatedEvent['data']): Promise<Order> {
    const { orderId } = data;
    const order = await this.orderModel.findOne({ _id: orderId });
    this.orderExists(orderId, order);
    order.set({ status: OrderStatus.Complete });
    await order.save();
    const result = order.toJSON<Order>();
    //? TODO: this.sendEvent(Patterns.OrderComplete, result);
    return result;
  }
}
