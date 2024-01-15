import { OryRelationshipsService } from '@getlarge/keto-client-wrapper';
import {
  createRelationQuery,
  relationTupleBuilder,
} from '@getlarge/keto-relations-parser';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import {
  EventsMap,
  OrderCancelledEvent,
  OrderCreatedEvent,
  Patterns,
} from '@ticketing/microservices/shared/events';
import {
  NextPaginationDto,
  PaginateDto,
  PermissionNamespaces,
} from '@ticketing/microservices/shared/models';
import { transactionManager } from '@ticketing/microservices/shared/mongo';
import { Resources } from '@ticketing/shared/constants';
import { User } from '@ticketing/shared/models';
import { isEmpty } from 'lodash-es';
import { Model } from 'mongoose';
import { Paginator } from 'nestjs-keyset-paginator';
import { lastValueFrom, Observable, timeout } from 'rxjs';

import { ORDERS_CLIENT } from '../shared/constants';
import { CreateTicket, Ticket, UpdateTicket } from './models';
import { Ticket as TicketSchema, TicketDocument } from './schemas';

@Injectable()
export class TicketsService {
  readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name)
    private readonly ticketModel: Model<TicketDocument>,
    @Inject(OryRelationshipsService)
    private readonly oryRelationshipsService: OryRelationshipsService,
    @Inject(ORDERS_CLIENT) private readonly client: ClientProxy,
  ) {}

  private sendEvent<
    P extends Patterns.TicketCreated | Patterns.TicketUpdated,
    E extends EventsMap[P],
  >(pattern: P, event: E): Observable<Ticket> {
    return this.client.send(pattern, event).pipe(timeout(5000));
  }

  async create(ticket: CreateTicket, currentUser: User): Promise<Ticket> {
    await using manager = await transactionManager(this.ticketModel);
    const res = await manager.wrap<Ticket>(async (session) => {
      const doc: CreateTicket & { userId: string } = {
        ...ticket,
        userId: currentUser.id,
      };
      const docs = await this.ticketModel.create([doc], {
        session,
      });
      const newTicket = docs[0].toJSON<Ticket>();
      this.logger.debug(`Created ticket ${newTicket.id}`);

      const relationTuple = relationTupleBuilder()
        .subject(PermissionNamespaces[Resources.USERS], currentUser.id)
        .isIn('owners')
        .of(PermissionNamespaces[Resources.TICKETS], newTicket.id)
        .toJSON();
      const createRelationshipBody =
        createRelationQuery(relationTuple).unwrapOrThrow();
      await this.oryRelationshipsService.createRelationship({
        createRelationshipBody,
      });
      this.logger.debug(`Created relation ${relationTuple.toString()}`);

      await lastValueFrom(this.sendEvent(Patterns.TicketCreated, newTicket));
      this.logger.debug(`Sent event ${Patterns.TicketCreated}`);
      return newTicket;
    });
    if (res.error) {
      throw res.error;
    }
    return res.value;
  }

  paginate(params: PaginateDto = {}): Promise<{
    docs: TicketDocument[];
    next_key: { key: string; value: string }[];
  }> {
    const {
      skip = 0,
      limit = 10,
      start_key = undefined,
      sort = undefined,
      filter = undefined,
      projection = undefined,
    } = params;
    // TODO: create a PR in nestjs-keyset-paginator to add document types
    return new Paginator().paginate(
      this.ticketModel,
      skip,
      limit,
      start_key,
      sort?.field,
      sort?.order,
      filter,
      projection,
    );
  }

  async find(
    params: PaginateDto = {},
  ): Promise<{ results: Ticket[]; next: NextPaginationDto[] }> {
    const { docs, next_key } = await this.paginate(params);
    const results = docs.map((ticket) => ticket.toJSON<Ticket>());
    return { results, next: next_key };
  }

  async findById(id: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (isEmpty(ticket)) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    return ticket.toJSON<Ticket>();
  }

  async updateById(id: string, update: UpdateTicket): Promise<Ticket> {
    await using manager = await transactionManager(this.ticketModel);
    const result = await manager.wrap(async (session) => {
      const ticket = await this.ticketModel
        .findOne({ _id: id })
        .session(session);
      if (isEmpty(ticket)) {
        throw new NotFoundException(`Ticket ${id} not found`);
      } else if (ticket.orderId) {
        throw new BadRequestException(`Ticket ${id} is currently reserved`);
      }

      ticket.set(update);
      await ticket.save({ session });
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.sendEvent(Patterns.TicketUpdated, updatedTicket),
      );
      return updatedTicket;
    });
    if (result.error) {
      this.logger.error(result.error);
      throw result.error;
    }
    return result.value;
  }

  async createOrder(event: OrderCreatedEvent['data']): Promise<Ticket> {
    const ticketId = event.ticket.id;
    const orderId = event.id;
    await using manager = await transactionManager(this.ticketModel);
    const result = await manager.wrap(async (session) => {
      const ticket = await this.ticketModel
        .findOne({ _id: ticketId })
        .session(session);
      if (isEmpty(ticket)) {
        throw new NotFoundException(`Ticket ${ticketId} not found`);
      }
      ticket.set({ orderId });
      await ticket.save({ session });
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.sendEvent(Patterns.TicketUpdated, updatedTicket),
      );
      return updatedTicket;
    });
    if (result.error) {
      this.logger.error(result.error);
      throw result.error;
    }
    return result.value;
  }

  async cancelOrder(event: OrderCancelledEvent['data']): Promise<Ticket> {
    const ticketId = event.ticket.id;
    await using manager = await transactionManager(this.ticketModel);
    const result = await manager.wrap(async (session) => {
      const ticket = await this.ticketModel
        .findOne({ _id: ticketId })
        .session(session);
      if (isEmpty(ticket)) {
        throw new NotFoundException(`Ticket ${ticketId} not found`);
      }
      ticket.set({ orderId: undefined });
      await ticket.save({ session: manager.session });
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.sendEvent(Patterns.TicketUpdated, updatedTicket).pipe(),
      );
      return updatedTicket;
    });
    if (result.error) {
      this.logger.error(result.error);
      throw result.error;
    }
    return result.value;
  }
}
