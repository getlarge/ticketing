import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParseObjectId } from '@ticketing/microservices/shared/pipes';
import { Resources } from '@ticketing/shared/constants';

import { FilterModerationsDto, ModerationDto } from './models';
import { ModerationsService } from './moderations.service';

@Controller(Resources.MODERATIONS)
export class ModerationsController {
  constructor(private readonly moderationService: ModerationsService) {}

  @Get()
  find(@Query() params: FilterModerationsDto): Promise<ModerationDto[]> {
    return this.moderationService.find(params);
  }

  @Get(':id')
  findById(@Param('id', ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.findById(id);
  }
}
