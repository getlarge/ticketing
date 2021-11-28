import { User } from '@ticketing/shared/models';
import { Types } from 'mongoose';

export const mockCurrentUser = (
  opts: {
    id?: string;
    email?: string;
  } = {}
): User => ({
  id: opts.id || new Types.ObjectId().toHexString(),
  email: opts.email || 'test@test.com',
});
