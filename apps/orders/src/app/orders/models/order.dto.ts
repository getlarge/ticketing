import { ApiProperty } from '@nestjs/swagger';
import { Order, OrderStatus } from '@ticketing/shared/models';

import { Ticket, TicketDto } from '../../tickets/models';

export class OrderDto extends Order {
  @ApiProperty({
    description: 'Order database identifier',
    required: true,
  })
  declare id: string;

  @ApiProperty({
    description: 'Ticket ordered reference',
    type: TicketDto,
    required: true,
  })
  declare ticket: Ticket;

  @ApiProperty({
    description: 'User who created the order',
    required: true,
  })
  declare userId: string;

  @ApiProperty({
    description: 'Order status',
    required: true,
    example: OrderStatus.Complete,
    enum: OrderStatus,
    enumName: 'OrderStatus',
    default: OrderStatus.Created,
  })
  declare status: OrderStatus;

  @ApiProperty({
    description: 'Order expiration date',
    required: false,
  })
  declare expiresAt?: string;

  @ApiProperty({
    description:
      'Order version represented by a number incremented at each updated',
    required: true,
  })
  declare version: number;
}
