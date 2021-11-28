import { Ticket } from '@ticketing/shared/models';
import { Types } from 'mongoose';

export const mockTicketEvent = (
  opts: {
    id?: string;
    userId?: string;
    title?: string;
    price?: number;
    version?: number;
  } = {}
): Ticket => ({
  id: opts.id || new Types.ObjectId().toHexString(),
  userId: opts.userId || new Types.ObjectId().toHexString(),
  title: opts.title || 'title',
  price: opts.price || 2,
  version: opts.version || 0,
});
