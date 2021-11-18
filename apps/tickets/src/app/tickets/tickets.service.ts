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
import * as models from '@ticketing/shared/models';
import { isEmpty } from 'lodash';

import { Ticket as TicketSchema, TicketModel } from './schemas/ticket.schema';

@Injectable()
export class TicketsService {
  readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name) private ticketModel: TicketModel,
    @Inject(Publisher) private publisher: Publisher
  ) {}

  async create(
    ticket: models.CreateTicket,
    currentUser: models.User
  ): Promise<models.Ticket> {
    const newTicket = await this.ticketModel.create({
      ...ticket,
      userId: currentUser.id,
    });
    const result = newTicket.toJSON<models.Ticket>();
    this.publisher
      .emit<TicketCreatedEvent['name'], TicketCreatedEvent['data']>(
        Patterns.TicketCreated,
        result
      )
      .subscribe({
        next: (value) =>
          this.logger.log(`Sent event ${Patterns.TicketCreated} ${value}`),
      });
    return result;
  }

  async find(): Promise<models.Ticket[]> {
    const tickets = (await this.ticketModel.find()) || [];
    return tickets.map((ticket) => ticket.toJSON<models.Ticket>());
  }

  async findById(id: string): Promise<models.Ticket> {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (isEmpty(ticket)) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    return ticket.toJSON<models.Ticket>();
  }

  async updateById(
    id: string,
    update: models.CreateTicket,
    currenUser: models.User
  ): Promise<models.Ticket> {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (isEmpty(ticket)) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    if (ticket.userId !== currenUser.id) {
      throw new ForbiddenException();
    }

    ticket.set(update);
    await ticket.save();
    const result = ticket.toJSON<models.Ticket>();
    this.publisher.emit<TicketUpdatedEvent['name'], TicketUpdatedEvent['data']>(
      Patterns.TicketUpdated,
      result
    );
    return result;
  }
}
