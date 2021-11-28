import { PartialType, PickType } from '@nestjs/swagger';

import { TicketDto } from './ticket.dto';

export class UpdateTicketDto extends PartialType(
  PickType(TicketDto, ['title', 'price', 'orderId'] as const)
) {}
