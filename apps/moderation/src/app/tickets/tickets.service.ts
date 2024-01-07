import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { EventsMap, Patterns } from '@ticketing/microservices/shared/events';
import { Ticket, TicketStatus } from '@ticketing/shared/models';
import type { Model } from 'mongoose';
import { firstValueFrom, lastValueFrom, Observable, timeout, zip } from 'rxjs';

import {
  type TicketApprovedEvent as InternalTicketApprovedEvent,
  type TicketCreatedEvent as InternalTicketCreatedEvent,
  type TicketRejectedEvent as InternalTicketRejectedEvent,
  TICKET_APPROVED_EVENT,
  TICKET_CREATED_EVENT,
  TICKET_REJECTED_EVENT,
} from '../shared/events';
import { Ticket as TicketSchema, TicketDocument } from './schemas';

type TicketWithStatus<S extends TicketStatus> = Omit<Ticket, 'status'> & {
  status: S;
};

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name) private ticketModel: Model<TicketDocument>,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject('TICKETS_CLIENT') private ticketsClient: ClientProxy,
    @Inject('ORDERS_CLIENT') private ordersClient: ClientProxy,
  ) {}

  async create(body: Ticket): Promise<void> {
    const ticket = await this.ticketModel.create({
      ...body,
      _id: body.id,
    });
    const event: InternalTicketCreatedEvent = {
      ticket: ticket.toJSON(),
      ctx: {},
    };
    try {
      await this.eventEmitter.emitAsync(TICKET_CREATED_EVENT, event);
    } catch (e) {
      await this.ticketModel.deleteOne({ _id: ticket.id });
      throw e;
    }
  }

  async updateById<S extends TicketStatus>(
    id: string,
    status: S,
  ): Promise<TicketWithStatus<S>> {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) {
      throw new Error(`Ticket not found - ${id}`);
    }
    ticket.set({ status });
    const updatedTicket = await ticket.save();
    return updatedTicket.toJSON() as TicketWithStatus<S>;
  }

  private sendMessage<
    R extends object,
    P extends Patterns.TicketApproved | Patterns.TicketRejected =
      | Patterns.TicketApproved
      | Patterns.TicketRejected,
    E extends EventsMap[P] = EventsMap[P],
  >(client: ClientProxy, pattern: P, event: E): Observable<R> {
    return client.send(pattern, event).pipe(timeout(5000));
  }

  @OnEvent(TICKET_APPROVED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onApproved(event: InternalTicketApprovedEvent): Promise<void> {
    this.logger.debug(`onApproved ${JSON.stringify(event)}`);
    const ticket = await this.updateById(
      event.ticket.id,
      TicketStatus.Approved,
    );
    await lastValueFrom(
      zip(
        this.sendMessage<{ ok: boolean }>(
          this.ticketsClient,
          Patterns.TicketApproved,
          ticket,
        ),
        this.sendMessage<Ticket>(
          this.ordersClient,
          Patterns.TicketApproved,
          ticket,
        ),
      ),
    );
  }

  @OnEvent(TICKET_REJECTED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onRejected(event: InternalTicketRejectedEvent): Promise<void> {
    this.logger.debug(`onRejected ${JSON.stringify(event)}`);
    const ticket = await this.updateById(
      event.ticket.id,
      TicketStatus.Rejected,
    );
    await firstValueFrom(
      this.sendMessage<{ ok: boolean }>(
        this.ticketsClient,
        Patterns.TicketRejected,
        ticket,
      ),
    );
  }
}
