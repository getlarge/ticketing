/* tslint:disable */
/* eslint-disable */
export interface PaymentDto {

  /**
   * Charge internal identifier
   */
  id: string;

  /**
   * Reference to the order
   */
  orderId: string;

  /**
   * Reference to the stripe charge
   */
  stripeId: string;

  /**
   * Payment version represented by a number incremented at each updated
   */
  version: number;
}
