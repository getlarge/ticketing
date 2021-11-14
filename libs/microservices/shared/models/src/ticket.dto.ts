import { ApiProperty } from '@nestjs/swagger';
import { Ticket, ticketContraints } from '@ticketing/shared/models';

export class TicketDto extends Ticket {
  @ApiProperty({
    description: 'Ticket title',
    required: true,
    minLength: ticketContraints.title.min,
    maxLength: ticketContraints.title.max,
  })
  title: string;

  @ApiProperty({
    description: 'Ticket price',
    required: true,
    minimum: ticketContraints.price.min,
  })
  price: number;
}
