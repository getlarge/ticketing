import { ApiProperty } from '@nestjs/swagger';
import { Ticket, ticketConstraints } from '@ticketing/shared/models';

export class TicketDto extends Ticket {
  @ApiProperty({
    description: 'Ticket database identifier',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'Ticket title',
    required: true,
    minLength: ticketConstraints.title.min,
    maxLength: ticketConstraints.title.max,
  })
  title: string;

  @ApiProperty({
    description: 'Ticket price',
    required: true,
    minimum: ticketConstraints.price.min,
  })
  price: number;

  @ApiProperty({
    description:
      'Ticket version represented by a number incremented at each updated',
    required: true,
  })
  version: number;

  @ApiProperty({
    description: 'Ticket creator id',
    required: true,
  })
  userId: string;
}
