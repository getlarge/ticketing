import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '@ticketing/shared/models';

export class PaymentDto extends Payment {
  @ApiProperty({
    description: 'Charge internal identifier',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'Reference to the order',
    required: true,
  })
  orderId: string;

  @ApiProperty({
    description: 'Reference to the stripe charge',
    required: true,
  })
  stripeId: string;
}
