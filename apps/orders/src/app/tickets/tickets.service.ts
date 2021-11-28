import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from '@ticketing/microservices/shared/events';

import { Ticket } from './models';
import { Ticket as TicketSchema, TicketDocument, TicketModel } from './schemas';

@Injectable()
export class TicketsService {
  readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name) private ticketModel: TicketModel
  ) {}

  async create(ticket: TicketCreatedEvent['data']): Promise<Ticket> {
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

  async findByEventVersion(event: {
    id: string;
    version: number;
  }): Promise<TicketDocument> {
    const { id } = event;
    const version = event.version - 1;
    const ticket = await this.ticketModel
      .findOne({
        _id: id,
        version,
      })
      .exec();
    if (!ticket) {
      throw new NotFoundException(
        `Ticket ${id} with version ${version} not found`
      );
    }
    return ticket;
  }

  async updateById(
    id: string,
    update: TicketUpdatedEvent['data']
  ): Promise<Ticket> {
    const ticket = await this.findByEventVersion(update);
    const { title, price } = update;
    ticket.set({ title, price });
    await ticket.save();
    return ticket.toJSON<Ticket>();
  }
}
