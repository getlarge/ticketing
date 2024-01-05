import { PickType } from '@nestjs/swagger';

import { ModerationDto } from './moderation.dto';

export class UpdateModerationDto extends PickType(ModerationDto, [
  'status',
  'rejectionReason',
] as const) { }
