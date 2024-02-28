import { PartialType, PickType } from '@nestjs/swagger';

import { ModerationDto } from './moderation.dto';

export class FilterModerationsDto extends PartialType(
  PickType(ModerationDto, ['status'] as const),
) {}
