import { Body, Controller, Get, Param, Patch, UseGuards, } from '@nestjs/common';
import { PermissionChecks } from '@ticketing/microservices/shared/decorators';
import { OryAuthenticationGuard, OryPermissionGuard } from '@ticketing/microservices/shared/guards';
import { PermissionNamespaces } from '@ticketing/microservices/shared/models';
import { ParseObjectId } from '@ticketing/microservices/shared/pipes';
import { relationTupleToString } from '@ticketing/microservices/shared/relation-tuple-parser';
import { CURRENT_USER_KEY, Resources } from '@ticketing/shared/constants';
import type { FastifyRequest } from 'fastify';
import { get } from 'lodash-es';

import { ModerationDto, UpdateModerationDto } from './models';
import { ModerationsService } from './moderations.service';

const adminPermission = (currentUserId: string): string =>
  relationTupleToString({
    namespace: PermissionNamespaces[Resources.GROUPS],
    object: 'admin',
    relation: 'members',
    subjectIdOrSet: {
      namespace: PermissionNamespaces[Resources.USERS],
      object: currentUserId,
    },
  });

const moderationPermission = (currentUserId: string, moderationId: string): string =>
  relationTupleToString({
    namespace: PermissionNamespaces[Resources.MODERATIONS],
    object: moderationId,
    relation: 'editors',
    subjectIdOrSet: {
      namespace: PermissionNamespaces[Resources.USERS],
      object: currentUserId,
    },
  });

@Controller(Resources.MODERATIONS)
export class ModerationsController {
  constructor(private readonly moderationService: ModerationsService) { }

  // TODO: use PaginateQuery and PaginatedDto<ModerationDto>
  @PermissionChecks((ctx) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const currentUserId = get(req, `${CURRENT_USER_KEY}.id`);
    return adminPermission(currentUserId);
  })
  @UseGuards(OryAuthenticationGuard, OryPermissionGuard)
  @Get()
  find(): Promise<ModerationDto[]> {
    return this.moderationService.find();
  }

  @PermissionChecks((ctx) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const currentUserId = get(req, `${CURRENT_USER_KEY}.id`);
    const resourceId = get(req.params, 'id');
    return moderationPermission(currentUserId, resourceId);
  })
  @UseGuards(OryAuthenticationGuard, OryPermissionGuard)
  @Get(':id')
  findById(@Param('id', ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.findById(id);
  }

  @PermissionChecks((ctx) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const currentUserId = get(req, `${CURRENT_USER_KEY}.id`);
    const resourceId = get(req.params, 'id');
    return moderationPermission(currentUserId, resourceId);
  })
  @UseGuards(OryAuthenticationGuard, OryPermissionGuard)
  @Patch(':id')
  updateById(
    @Param('id', ParseObjectId) id: string,
    @Body() update: UpdateModerationDto
  ): Promise<ModerationDto> {
    return this.moderationService.updateById(id, update);
  }
}
