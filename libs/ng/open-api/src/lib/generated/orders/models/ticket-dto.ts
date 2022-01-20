/* tslint:disable */
/* eslint-disable */
export interface TicketDto {

  /**
   * Ticket database identifier
   */
  id: string;

  /**
   * Ticket price
   */
  price: number;

  /**
   * Ticket title
   */
  title: string;

  /**
   * Ticket version represented by a number incremented at each updated
   */
  version: number;
}
