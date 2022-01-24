import { OrderStatus } from '@ticketing/shared/models';

export interface OrderFilter {
  expiresAt: number | null;
  status: OrderStatus | null;
}
