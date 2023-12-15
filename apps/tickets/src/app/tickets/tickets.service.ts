import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { OryPermissionsService } from '@ticketing/microservices/ory-client';
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  Patterns,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from '@ticketing/microservices/shared/events';
import {
  NextPaginationDto,
  PaginateDto,
} from '@ticketing/microservices/shared/models';
import { transactionManager } from '@ticketing/microservices/shared/mongo';
import { User } from '@ticketing/shared/models';
import { isEmpty } from 'lodash-es';
import { Model } from 'mongoose';
import { Paginator } from 'nestjs-keyset-paginator';
import { lastValueFrom, Observable } from 'rxjs';

import { ORDERS_CLIENT } from '../shared/constants';
import { CreateTicket, Ticket, UpdateTicket } from './models';
import { Ticket as TicketSchema, TicketDocument } from './schemas';

@Injectable()
export class TicketsService {
  readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name)
    private readonly ticketModel: Model<TicketDocument>,
    @Inject(ORDERS_CLIENT) private readonly client: ClientProxy,
  ) {}

  emitEvent(
    pattern: Patterns.TicketCreated | Patterns.TicketUpdated,
    event: TicketCreatedEvent['data'] | TicketUpdatedEvent['data'],
  ): Observable<string> {
    return this.client.emit(pattern, event);
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
      await lastValueFrom(this.emitEvent(Patterns.TicketCreated, newTicket));
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

  async updateById(
    id: string,
    update: UpdateTicket,
    currenUser: User,
  ): Promise<Ticket> {
    await using manager = await transactionManager(this.ticketModel);
    const result = await manager.wrap(async (session) => {
      const ticket = await this.ticketModel
        .findOne({ _id: id })
        .session(session);
      if (isEmpty(ticket)) {
        throw new NotFoundException(`Ticket ${id} not found`);
      } else if (ticket.userId !== currenUser.id) {
        // TODO: should be handled by Ory permissions only
        throw new ForbiddenException();
      } else if (ticket.orderId) {
        throw new BadRequestException(`Ticket ${id} is currently reserved`);
      }
      ticket.set(update);
      await ticket.save({ session });
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.emitEvent(Patterns.TicketUpdated, updatedTicket),
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
      // TODO: create relation between ticket and order
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.emitEvent(Patterns.TicketUpdated, updatedTicket),
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
      // TODO: delete relation between ticket and order
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.emitEvent(Patterns.TicketUpdated, updatedTicket).pipe(),
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
