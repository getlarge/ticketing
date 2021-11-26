import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Publisher } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import {
  Patterns,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from '@ticketing/microservices/shared/events';
import { User } from '@ticketing/shared/models';
import { isEmpty } from 'lodash';
import { Model } from 'mongoose';

import { CreateTicket, Ticket } from './models';
import { Ticket as TicketSchema, TicketDocument } from './schemas';

@Injectable()
export class TicketsService {
  readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name) private ticketModel: Model<TicketDocument>,
    @Inject(Publisher) private publisher: Publisher
  ) {}

  async create(ticket: CreateTicket, currentUser: User): Promise<Ticket> {
    const newTicket = await this.ticketModel.create({
      ...ticket,
      userId: currentUser.id,
    });
    const result = newTicket.toJSON<Ticket>();
    this.publisher
      .emit<string, TicketCreatedEvent['data']>(Patterns.TicketCreated, result)
      .subscribe({
        next: (value) =>
          this.logger.log(`Sent event ${Patterns.TicketCreated} ${value}`),
      });
    return result;
  }

  async find(): Promise<Ticket[]> {
    const tickets = (await this.ticketModel.find()) || [];
    return tickets.map((ticket) => ticket.toJSON<Ticket>());
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
    update: CreateTicket,
    currenUser: User
  ): Promise<Ticket> {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (isEmpty(ticket)) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    if (ticket.userId !== currenUser.id) {
      throw new ForbiddenException();
    }

    ticket.set(update);
    await ticket.save();
    const result = ticket.toJSON<Ticket>();
    this.publisher
      .emit<string, TicketUpdatedEvent['data']>(Patterns.TicketUpdated, result)
      .subscribe({
        next: () => this.logger.log(`Sent event ${Patterns.TicketUpdated}`),
      });
    return result;
  }
}
