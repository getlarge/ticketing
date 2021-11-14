import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTicket, Ticket, User } from '@ticketing/shared/models';
import { isEmpty } from 'lodash';

import { Ticket as TicketSchema, TicketModel } from './schemas/ticket.schema';

@Injectable()
export class TicketsService {
  readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name) private ticketModel: TicketModel
  ) {}

  async create(ticket: CreateTicket, currentUser: User): Promise<Ticket> {
    const newTicket = await this.ticketModel.create({
      ...ticket,
      userId: currentUser.id,
    });
    return newTicket.toJSON<Ticket>();
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
    return ticket.toJSON<Ticket>();
  }
}
