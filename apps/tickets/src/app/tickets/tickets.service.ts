import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Publisher } from '@nestjs-plugins/nestjs-nats-streaming-transport';
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
import { User } from '@ticketing/shared/models';
import { isEmpty } from 'lodash';
import { Model } from 'mongoose';
import Paginator from 'nestjs-keyset-paginator';
import { lastValueFrom, Observable } from 'rxjs';

import { CreateTicket, Ticket, UpdateTicket } from './models';
import { Ticket as TicketSchema, TicketDocument } from './schemas';

@Injectable()
export class TicketsService {
  readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name) private ticketModel: Model<TicketDocument>,
    @Inject(Publisher) private publisher: Publisher
  ) {}

  emitEvent(
    pattern: Patterns.TicketCreated | Patterns.TicketUpdated,
    event: TicketCreatedEvent['data'] | TicketUpdatedEvent['data']
  ): Observable<string> {
    return this.publisher.emit<string, typeof event>(pattern, event);
  }

  async create(ticket: CreateTicket, currentUser: User): Promise<Ticket> {
    const newTicket = await this.ticketModel.create({
      ...ticket,
      userId: currentUser.id,
    });
    const result = newTicket.toJSON<Ticket>();
    this.emitEvent(Patterns.TicketCreated, result);
    return result;
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
      projection
    );
  }

  async find(
    params: PaginateDto = {}
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
    currenUser: User
  ): Promise<Ticket> {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (isEmpty(ticket)) {
      throw new NotFoundException(`Ticket ${id} not found`);
    } else if (ticket.userId !== currenUser.id) {
      throw new ForbiddenException();
    } else if (ticket.orderId) {
      throw new BadRequestException(`Ticket ${id} is currently reserved`);
    }
    ticket.set(update);
    await ticket.save();
    const result = ticket.toJSON<Ticket>();
    this.emitEvent(Patterns.TicketUpdated, result);
    return result;
  }

  async createOrder(event: OrderCreatedEvent['data']): Promise<Ticket> {
    const ticketId = event.ticket.id;
    const orderId = event.id;
    const ticket = await this.ticketModel.findOne({ _id: ticketId });
    if (isEmpty(ticket)) {
      throw new NotFoundException(`Ticket ${ticketId} not found`);
    }
    ticket.set({ orderId });
    await ticket.save();
    const result = ticket.toJSON<Ticket>();
    await lastValueFrom(this.emitEvent(Patterns.TicketUpdated, result).pipe());
    return result;
  }

  async cancelOrder(event: OrderCancelledEvent['data']): Promise<Ticket> {
    const ticketId = event.ticket.id;
    const ticket = await this.ticketModel.findOne({ _id: ticketId });
    if (isEmpty(ticket)) {
      throw new NotFoundException(`Ticket ${ticketId} not found`);
    }
    ticket.set({ orderId: undefined });
    await ticket.save();
    const result = ticket.toJSON<Ticket>();
    await lastValueFrom(this.emitEvent(Patterns.TicketUpdated, result).pipe());
    return result;
  }
}
