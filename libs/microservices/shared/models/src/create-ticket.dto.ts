import { PickType } from '@nestjs/swagger';

import { TicketDto } from './ticket.dto';

export class CreateTicketDto extends PickType(TicketDto, [
  'title',
  'price',
] as const) {}
