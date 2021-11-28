import { Ticket } from '@ticketing/shared/models';
import { Types } from 'mongoose';

export const mockTicket = (
  opts: {
    id?: string;
    price?: number;
    title?: string;
    version?: number;
    userId?: string;
  } = {}
): Ticket => ({
  id: opts.id || new Types.ObjectId().toHexString(),
  userId: opts.userId || new Types.ObjectId().toHexString(),
  version: opts.version || 0,
  price: opts.price || 1,
  title: opts.title || 'ticket title',
});
