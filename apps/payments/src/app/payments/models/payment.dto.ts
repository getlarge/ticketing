import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '@ticketing/shared/models';

export class PaymentDto extends Payment {
  @ApiProperty({
    description: 'Charge internal identifier',
    required: true,
  })
  declare id: string;

  @ApiProperty({
    description: 'Reference to the order',
    required: true,
  })
  declare orderId: string;

  @ApiProperty({
    description: 'Reference to the stripe charge',
    required: true,
  })
  declare stripeId: string;

  @ApiProperty({
    description:
      'Payment version represented by a number incremented at each update',
    required: true,
  })
  declare version: number;
}
