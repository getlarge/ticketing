import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Ticket } from './models';
import { Ticket as TicketSchema, TicketDocument, TicketModel } from './schemas';

@Injectable()
export class TicketsService {
  readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name) private ticketModel: TicketModel
  ) {}

  async create(ticket: Ticket): Promise<Ticket> {
    const newTicket = await this.ticketModel.create({
      ...ticket,
      _id: ticket.id,
    });
    return newTicket.toJSON<Ticket>();
  }

  async findById(id: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findOne({ _id: id }).exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    return ticket.toJSON<Ticket>();
  }

  findByEventVersion(event: {
    id: string;
    version: number;
  }): Promise<TicketDocument> {
    return this.ticketModel
      .findOne({
        _id: event.id,
        version: event.version - 1,
      })
      .exec();
  }

  async updateById(id: string, update: Ticket): Promise<Ticket> {
    const ticket = await this.findByEventVersion(update);
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    const { title, price } = update;
    ticket.set({ title, price });
    await ticket.save();
    return ticket.toJSON<Ticket>();
  }
}
