import {
  Body,
  Controller,
  ExecutionContext,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { PermissionChecks } from '@ticketing/microservices/shared/decorators';
import {
  OryAuthenticationGuard,
  OryPermissionGuard,
} from '@ticketing/microservices/shared/guards';
import { PermissionNamespaces } from '@ticketing/microservices/shared/models';
import { ParseObjectId } from '@ticketing/microservices/shared/pipes';
import { relationTupleToString } from '@ticketing/microservices/shared/relation-tuple-parser';
import { CURRENT_USER_KEY, Resources } from '@ticketing/shared/constants';
import type { FastifyRequest } from 'fastify';
import { get } from 'lodash-es';

import { ModerationDto, RejectModerationDto } from './models';
import { ModerationsService } from './moderations.service';

const adminPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = get(req, `${CURRENT_USER_KEY}.id`);
  return relationTupleToString({
    namespace: PermissionNamespaces[Resources.GROUPS],
    object: 'admin',
    relation: 'members',
    subjectIdOrSet: {
      namespace: PermissionNamespaces[Resources.USERS],
      object: currentUserId,
    },
  });
};

const moderationPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = get(req, `${CURRENT_USER_KEY}.id`);
  const moderationId = get(req.params, 'id');
  return relationTupleToString({
    namespace: PermissionNamespaces[Resources.MODERATIONS],
    object: moderationId,
    relation: 'editors',
    subjectIdOrSet: {
      namespace: PermissionNamespaces[Resources.USERS],
      object: currentUserId,
    },
  });
};

@Controller(Resources.MODERATIONS)
export class ModerationsController {
  constructor(private readonly moderationService: ModerationsService) {}

  // TODO: use PaginateQuery and PaginatedDto<ModerationDto>
  @PermissionChecks(adminPermission)
  @UseGuards(OryAuthenticationGuard, OryPermissionGuard)
  @Get()
  find(): Promise<ModerationDto[]> {
    return this.moderationService.find();
  }

  @PermissionChecks(moderationPermission)
  @UseGuards(OryAuthenticationGuard, OryPermissionGuard)
  @Get(':id')
  findById(@Param('id', ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.findById(id);
  }

  @PermissionChecks(moderationPermission)
  @UseGuards(OryAuthenticationGuard, OryPermissionGuard)
  @Patch(':id/approve')
  approveById(@Param('id', ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.approveById(id);
  }

  @PermissionChecks(moderationPermission)
  @UseGuards(OryAuthenticationGuard, OryPermissionGuard)
  @Patch(':id/reject')
  rejectById(
    @Param('id', ParseObjectId) id: string,
    @Body() { rejectionReason }: RejectModerationDto,
  ): Promise<ModerationDto> {
    return this.moderationService.rejectById(id, rejectionReason);
  }
}