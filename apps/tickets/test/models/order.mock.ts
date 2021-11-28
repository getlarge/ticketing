import { Order, OrderStatus } from '@ticketing/shared/models';
import { Types } from 'mongoose';

export const mockOrderEvent = (
  opts: {
    id?: string;
    userId?: string;
    status?: OrderStatus;
    version?: number;
    ticket?: { id: string; price: number; title: string; version: number };
  } = {}
): Order => ({
  id: opts.id || new Types.ObjectId().toHexString(),
  userId: opts.userId || new Types.ObjectId().toHexString(),
  status: opts.status || OrderStatus.Created,
  version: opts.version || 0,
  ticket: opts.ticket || {
    id: new Types.ObjectId().toHexString(),
    price: 2,
    title: 'ticket title',
    version: 0,
  },
});
