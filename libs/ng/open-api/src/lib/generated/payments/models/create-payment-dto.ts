/* tslint:disable */
/* eslint-disable */
export interface CreatePaymentDto {

  /**
   * Order for which payment is attempted
   */
  orderId: string;

  /**
   * Stripe token
   */
  token: string;
}
