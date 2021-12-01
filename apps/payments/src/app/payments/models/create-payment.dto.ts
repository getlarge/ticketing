import { ApiProperty } from '@nestjs/swagger';

import { CreatePayment } from './create-payment';

export class CreatePaymentDto extends CreatePayment {
  @ApiProperty({
    description: 'Order for which payment is attempted',
    required: true,
  })
  orderId: string;

  @ApiProperty({
    description: 'Stripe token',
    required: true,
    example: 'tok_visa',
  })
  token: string;
}
