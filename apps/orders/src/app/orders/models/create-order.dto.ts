import { ApiProperty } from '@nestjs/swagger';

import { CreateOrder } from './create-order';

export class CreateOrderDto extends CreateOrder {
  @ApiProperty({
    description: 'Ticket to order',
    required: true,
  })
  ticketId: string;
}
