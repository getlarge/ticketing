import { ApiProperty } from '@nestjs/swagger';
import { Order, OrderStatus } from '@ticketing/shared/models';

import { Ticket, TicketDto } from '../../tickets/models';

export class OrderDto extends Order {
  @ApiProperty({
    description: 'Order database identifier',
    required: true,
  })
  id: string;

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

  @ApiProperty({
    description:
      'Order version represented by a number incremented at each updated',
    required: true,
  })
  version: number;
}
