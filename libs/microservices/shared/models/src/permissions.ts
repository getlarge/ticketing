import { Resources } from '@ticketing/shared/constants';

export type PermissionObjects = {
  currentUserId: string | 'Unauthorized';
  resourceId?: string;
};

export const PermissionNamespaces = {
  [Resources.GROUPS]: 'Group',
  [Resources.ORDERS]: 'Order',
  [Resources.PAYMENTS]: 'Payment',
  [Resources.TICKETS]: 'Ticket',
  [Resources.USERS]: 'User',
};

export type PermissionNamespaces = typeof PermissionNamespaces;
