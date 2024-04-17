import { OryRelationshipsService } from '@getlarge/keto-client-wrapper';
import {
  createRelationQuery,
  relationTupleBuilder,
} from '@getlarge/keto-relations-parser';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Relationship } from '@ory/client';
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
  PermissionNamespaces,
} from '@ticketing/microservices/shared/models';
import { transactionManager } from '@ticketing/microservices/shared/mongo';
import { Resources } from '@ticketing/shared/constants';
import { isErrorResponse, RetriableError } from '@ticketing/shared/errors';
import { User } from '@ticketing/shared/models';
import { Model } from 'mongoose';
import { Paginator } from 'nestjs-keyset-paginator';
import {
  catchError,
  lastValueFrom,
  retry,
  throwError,
  timeout,
  timer,
} from 'rxjs';

import { MODERATIONS_CLIENT, ORDERS_CLIENT } from '../shared/constants';
import { CreateTicket, Ticket, UpdateTicket } from './models';
import { Ticket as TicketSchema, TicketDocument } from './schemas';

@Injectable()
export class TicketsService {
  readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name)
    private readonly ticketModel: Model<TicketDocument>,
    @Inject(OryRelationshipsService)
    private readonly oryRelationshipsService: OryRelationshipsService,
    @Inject(ORDERS_CLIENT) private readonly ordersClient: ClientProxy,
    @Inject(MODERATIONS_CLIENT) private readonly moderationClient: ClientProxy,
  ) {}

  async create(ticket: CreateTicket, currentUser: User): Promise<Ticket> {
    let createdRelation: Relationship | undefined;
    try {
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

        const relationTuple = relationTupleBuilder()
          .subject(PermissionNamespaces[Resources.USERS], currentUser.id)
          .isIn('owners')
          .of(PermissionNamespaces[Resources.TICKETS], newTicket.id);
        const createRelationshipBody = createRelationQuery(
          relationTuple.toJSON(),
        ).unwrapOrThrow();
        const { data } = await this.oryRelationshipsService.createRelationship({
          createRelationshipBody,
        });
        createdRelation = data;
        this.logger.debug(`Created relation ${relationTuple.toString()}`);

        await lastValueFrom(
          this.moderationClient
            .send<TicketCreatedEvent['name'], TicketCreatedEvent['data']>(
              Patterns.TicketCreated,
              newTicket,
            )
            .pipe(
              retry({
                count: 5,
                delay: (error: Error, retryCount: number) => {
                  const scalingDuration = 500;
                  if (
                    isErrorResponse(error) &&
                    error.name === RetriableError.name
                  ) {
                    this.logger.debug(`retry attempt #${retryCount}`);
                    return timer(retryCount * scalingDuration);
                  }
                  throw error;
                },
              }),
              timeout(8000),
              catchError((err) => {
                this.logger.error(err);
                return throwError(() => err);
              }),
            ),
        );
        this.logger.debug(`Sent event ${Patterns.TicketCreated}`);
        return newTicket;
      });

      if (res.error) {
        throw res.error;
      }
      return res.value;
    } catch (error) {
      if (createdRelation) {
        await this.oryRelationshipsService.deleteRelationships(createdRelation);
      }
      throw error;
    }
  }

  paginate(params: PaginateDto = {}): Promise<{
    docs: TicketDocument[];
    next_key: { key: string; value: string }[];
  }> {
    const { skip = 0, limit = 10, sort = undefined } = params;
    // TODO: create a PR in nestjs-keyset-paginator to add document types
    return new Paginator().paginate(
      this.ticketModel,
      skip,
      limit,
      params.start_key,
      sort?.field,
      sort?.order,
      params.filter,
      params.projection,
    );
  }

  async find(
    params: PaginateDto = {},
  ): Promise<{ results: Ticket[]; next: NextPaginationDto[] }> {
    const paginatedResult = await this.paginate(params);
    const results = paginatedResult.docs.map((ticket) =>
      ticket.toJSON<Ticket>(),
    );
    return { results, next: paginatedResult.next_key };
  }

  async findById(id: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (!ticket?.id) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    return ticket.toJSON<Ticket>();
  }

  /**
   * @description this method is used to update the status of a ticket internally only
   */
  async updateStatusById(
    id: string,
    status: Ticket['status'],
  ): Promise<Ticket> {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (!ticket?.id) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    ticket.set({ status });
    await ticket.save();
    return ticket.toJSON<Ticket>();
  }

  async updateById(id: string, update: UpdateTicket): Promise<Ticket> {
    await using manager = await transactionManager(this.ticketModel);
    const result = await manager.wrap(async (session) => {
      const ticket = await this.ticketModel
        .findOne({ _id: id })
        .session(session);
      if (ticket?.id) {
        throw new NotFoundException(`Ticket ${id} not found`);
      } else if (ticket.orderId) {
        throw new BadRequestException(`Ticket ${id} is currently reserved`);
      }

      ticket.set(update);
      await ticket.save({ session });
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.ordersClient
          .send<TicketUpdatedEvent['name'], TicketUpdatedEvent['data']>(
            Patterns.TicketUpdated,
            updatedTicket,
          )
          .pipe(timeout(5000)),
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
      if (ticket?.id) {
        throw new NotFoundException(`Ticket ${ticketId} not found`);
      }
      ticket.set({ orderId });
      await ticket.save({ session });
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.ordersClient
          .send<TicketUpdatedEvent['name'], TicketUpdatedEvent['data']>(
            Patterns.TicketUpdated,
            updatedTicket,
          )
          .pipe(timeout(5000)),
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
      if (ticket?.id) {
        throw new NotFoundException(`Ticket ${ticketId} not found`);
      }
      ticket.set({ orderId: undefined });
      await ticket.save({ session: manager.session });
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.ordersClient
          .send<TicketUpdatedEvent['name'], TicketUpdatedEvent['data']>(
            Patterns.TicketUpdated,
            updatedTicket,
          )
          .pipe(timeout(5000)),
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
