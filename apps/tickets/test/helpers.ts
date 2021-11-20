import { Model, Types } from 'mongoose';

import { Ticket } from '../src/app/tickets/models';
import { TicketDocument } from '../src/app/tickets/schemas';

export async function createTicket(
  options: {
    title?: string;
    price?: number;
    userId?: string;
  },
  ticketModel: Model<TicketDocument>
): Promise<Ticket> {
  const ticketToCreate = {
    title: options?.title || 'title',
    price: options?.price || 20,
    userId: options?.userId || new Types.ObjectId().toHexString(),
  };
  const ticket = await ticketModel.create(ticketToCreate);
  return ticket.toJSON<Ticket>();
}
