import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import {
  Patterns,
  TicketApprovedEvent,
  TicketRejectedEvent,
} from '@ticketing/microservices/shared/events';
import { Ticket } from '@ticketing/shared/models';
import type { Model } from 'mongoose';
import { firstValueFrom, Observable, zip } from 'rxjs';

import {
  type TicketApprovedEvent as InternalTicketApprovedEvent,
  type TicketCreatedEvent as InternalTicketCreatedEvent,
  type TicketRejectedEvent as InternalTicketRejectedEvent,
  TICKET_APPROVED_EVENT,
  TICKET_CREATED_EVENT,
  TICKET_REJECTED_EVENT,
} from '../shared/events';
import { Ticket as TicketSchema, TicketDocument } from './schemas';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name) private ticketModel: Model<TicketDocument>,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject('TICKETS_CLIENT') private ticketsClient: ClientProxy,
    @Inject('ORDERS_CLIENT') private ordersClient: ClientProxy
  ) { }

  async create(body: Ticket): Promise<void> {
    const ticket = await this.ticketModel.create(body);
    const event: InternalTicketCreatedEvent = {
      ticket: ticket.toJSON(),
      ctx: {},
    };
    this.eventEmitter.emit(TICKET_CREATED_EVENT, event);
  }

  private emitEvent(
    pattern: Patterns.TicketApproved | Patterns.TicketRejected,
    event: TicketApprovedEvent['data'] | TicketRejectedEvent['data']
  ): Observable<[string, string]> {
    return zip(
      this.ticketsClient.emit<string, typeof event>(pattern, event),
      this.ordersClient.emit<string, typeof event>(pattern, event)
    );
  }

  @OnEvent(TICKET_APPROVED_EVENT, { async: true })
  async onApproved(event: InternalTicketApprovedEvent): Promise<void> {
    this.logger.debug(`onApproved ${JSON.stringify(event)}`);
    await firstValueFrom(
      this.emitEvent(Patterns.TicketApproved, event.ticket).pipe()
    );
  }

  @OnEvent(TICKET_REJECTED_EVENT, { async: true })
  async onRejected(event: InternalTicketRejectedEvent): Promise<void> {
    this.logger.debug(`onRejected ${JSON.stringify(event)}`);
    await firstValueFrom(
      this.emitEvent(Patterns.TicketApproved, event.ticket,).pipe()
    );
  }
}
