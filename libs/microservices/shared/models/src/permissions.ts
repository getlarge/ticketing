import { Resources } from '@ticketing/shared/constants';

export type PermissionObjects = {
  currentUserId: string | 'Unauthorized';
  resourceId?: string;
};

export const PermissionNamespaces = {
  [Resources.USERS]: 'User',
  [Resources.TICKETS]: 'Ticket',
  [Resources.ORDERS]: 'Order',
  [Resources.PAYMENTS]: 'Payment',
};

export type PermissionNamespaces = typeof PermissionNamespaces;

// TODO: add relations / namespace ?
// TODO: add permissions / namespace ?
