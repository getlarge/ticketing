/* tslint:disable */
/* eslint-disable */
export interface TicketDto {

  /**
   * Ticket database identifier
   */
  id: string;

  /**
   * Ticket reservation order id
   */
  orderId?: string;

  /**
   * Ticket price
   */
  price: number;

  /**
   * Ticket title
   */
  title: string;

  /**
   * Ticket creator id
   */
  userId: string;

  /**
   * Ticket version represented by a number incremented at each updated
   */
  version: number;
}
