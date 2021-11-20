import { ApiProperty } from '@nestjs/swagger';
import { Order, OrderStatus } from '@ticketing/shared/models';

import { Ticket } from './ticket';
import { TicketDto } from './ticket.dto';

export class OrderDto extends Order {
  @ApiProperty({
    description: 'Ticket ordered reference',
    type: TicketDto,
    required: true,
  })
  ticket: Ticket;

  @ApiProperty({
    description: 'User who created the order',
    required: true,
  })
  userId: string;

  @ApiProperty({
    description: 'Order status',
    required: true,
    example: OrderStatus.Complete,
    enum: OrderStatus,
    enumName: 'OrderStatus',
    default: OrderStatus.Created,
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Order expiration date',
    required: false,
  })
  expiresAt?: string;
}
