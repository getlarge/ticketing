/* tslint:disable */
/* eslint-disable */
import { OrderStatus } from './order-status';
import { TicketDto } from './ticket-dto';
export interface OrderDto {

  /**
   * Order expiration date
   */
  expiresAt?: string;

  /**
   * Order status
   */
  status: OrderStatus;

  /**
   * Ticket ordered reference
   */
  ticket: TicketDto;

  /**
   * User who created the order
   */
  userId: string;
}
