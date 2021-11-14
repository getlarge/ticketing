import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTicket, Ticket, User } from '@ticketing/shared/models';

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
    return newTicket.toJSON();
  }
}
