import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Moderation, ModerationStatus } from '@ticketing/shared/models';

export class ModerationTicketDto extends Moderation['ticket'] {
  @ApiProperty({
    description: 'Ticket database identifier',
  })
  declare id: string;

  @ApiProperty({
    description: 'Ticket title',
  })
  declare title: string;

  @ApiProperty({
    description: 'Ticket price',
  })
  declare price: number;

  @ApiProperty({
    description: 'Ticket version',
  })
  declare version: number;
}

export class ModerationDto extends Moderation {
  @ApiProperty()
  declare id: string;

  @ApiProperty({
    description: 'Moderation status',
    enum: Object.values(ModerationStatus),
  })
  declare status: ModerationStatus;

  @ApiPropertyOptional({
    description: 'Moderation rejection reason',
  })
  declare rejectionReason?: string;

  @ApiProperty({
    description: 'Moderation ticket',
    type: () => ModerationTicketDto,
  })
  declare ticket: Moderation['ticket'];

  @ApiPropertyOptional({
    description: 'Moderation moderator id',
  })
  declare moderatorId?: string;

  @ApiProperty({
    description: 'Moderation version',
  })
  declare version: number;
}
