import {
  OryAuthorizationGuard,
  OryPermissionChecks,
} from '@getlarge/keto-client-wrapper';
import { relationTupleBuilder } from '@getlarge/keto-relations-parser';
import { OryAuthenticationGuard } from '@getlarge/kratos-client-wrapper';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  Get,
  Param,
  Patch,
  Query,
  Type,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { PermissionNamespaces } from '@ticketing/microservices/shared/models';
import { ParseObjectId } from '@ticketing/microservices/shared/pipes';
import { CURRENT_USER_KEY, Resources } from '@ticketing/shared/constants';
import {
  AcceptableError,
  requestValidationErrorFactory,
} from '@ticketing/shared/errors';
import { ModerationStatus } from '@ticketing/shared/models';
import type { FastifyRequest } from 'fastify';

import { GenericExceptionFilter } from '../filters/exception.filter';
import {
  FilterModerationsDto,
  ModerationDto,
  RejectModerationDto,
} from './models';
import { ModerationsService } from './moderations.service';

const adminPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = req[`${CURRENT_USER_KEY}`]['id'];
  return relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.USERS], currentUserId)
    .isIn('members')
    .of(PermissionNamespaces[Resources.GROUPS], 'admin')
    .toString();
};

const moderationPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = req[`${CURRENT_USER_KEY}`]['id'];
  const moderationId = (req.params as { id: string }).id;
  return relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.USERS], currentUserId)
    .isIn('editors')
    .of(PermissionNamespaces[Resources.MODERATIONS], moderationId)
    .toString();
};

const AuthenticationGuard = (): Type<CanActivate> =>
  OryAuthenticationGuard({
    cookieResolver: (ctx) =>
      ctx.switchToHttp().getRequest<FastifyRequest>().headers.cookie,
    isValidSession: (x) => {
      return (
        !!x?.identity &&
        typeof x.identity.traits === 'object' &&
        !!x.identity.traits &&
        'email' in x.identity.traits &&
        typeof x.identity.metadata_public === 'object' &&
        !!x.identity.metadata_public &&
        'id' in x.identity.metadata_public &&
        typeof x.identity.metadata_public.id === 'string'
      );
    },
    sessionTokenResolver: (ctx) =>
      ctx
        .switchToHttp()
        .getRequest<FastifyRequest>()
        .headers?.authorization?.replace('Bearer ', ''),
    postValidationHook: (ctx, session) => {
      ctx.switchToHttp().getRequest().session = session;
      ctx.switchToHttp().getRequest()[CURRENT_USER_KEY] = {
        id: session.identity.metadata_public['id'],
        email: session.identity.traits.email,
        identityId: session.identity.id,
      };
    },
    unauthorizedFactory(ctx) {
      return new AcceptableError(
        'Unauthorized',
        401,
        ctx.switchToHttp().getRequest().url,
      );
    },
  });

const AuthorizationGuard = (): Type<CanActivate> =>
  OryAuthorizationGuard({
    unauthorizedFactory(ctx) {
      return new AcceptableError(
        'Forbidden',
        403,
        ctx.switchToHttp().getRequest().url,
      );
    },
  });

const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  exceptionFactory: requestValidationErrorFactory,
  forbidUnknownValues: true,
  whitelist: true,
};

@UseFilters(GenericExceptionFilter)
@Controller(Resources.MODERATIONS)
export class ModerationsController {
  constructor(private readonly moderationService: ModerationsService) {}

  @OryPermissionChecks(adminPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @UseInterceptors(CacheInterceptor)
  @CacheTTL((ctx) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const query = (req.query as FilterModerationsDto) ?? {};
    switch (query?.status) {
      case ModerationStatus.Approved:
      case ModerationStatus.Rejected:
        return 60;
      case ModerationStatus.Pending:
      case ModerationStatus.RequiresManualReview:
      default:
        return 5;
    }
  })
  @Get()
  find(
    @Query(new ValidationPipe(validationPipeOptions))
    params: FilterModerationsDto,
  ): Promise<ModerationDto[]> {
    return this.moderationService.find(params);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Get(':id')
  findById(@Param('id', ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.findById(id);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Patch(':id/approve')
  approveById(@Param('id', ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.approveById(id);
  }

  @UsePipes(new ValidationPipe(validationPipeOptions))
  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Patch(':id/reject')
  rejectById(
    @Param('id', ParseObjectId) id: string,
    @Body() { rejectionReason }: RejectModerationDto = {},
  ): Promise<ModerationDto> {
    return this.moderationService.rejectById(id, rejectionReason);
  }
}