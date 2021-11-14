import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Session,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@ticketing/microservices/shared/guards';
import {
  UserCredentialsDto,
  UserDto,
} from '@ticketing/microservices/shared/models';
import {
  Actions,
  Resources,
  SESSION_ACCESS_TOKEN,
} from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { User, UserCredentials, UserResponse } from '@ticketing/shared/models';
import type { Session as FastifySession } from 'fastify-secure-session';

import { LocalAuthGuard } from '../guards/local-auth.guard';
import { CurrentUser } from '../shared/current-user.decorator';
import { UsersService } from './users.service';

@Controller(Resources.USERS)
@ApiTags(Resources.USERS)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
    })
  )
  @ApiOperation({
    description: 'Request creation of a user',
    summary: `Register a user - Scope : ${Resources.USERS}:${Actions.CREATE_ONE}`,
  })
  @ApiBody({ type: UserCredentialsDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created',
    type: UserDto,
  })
  @Post('sign-up')
  signUp(@Body() user: UserCredentials): Promise<UserResponse> {
    return this.usersService.signUp(user);
  }

  @UseGuards(LocalAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
    })
  )
  @ApiBody({ type: UserCredentialsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'JWT Token',
    schema: {
      type: 'object',
      properties: {
        token: {
          description: 'JWT token',
          type: 'string',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Body() _user: UserCredentials,
    @Session() session: FastifySession,
    @CurrentUser() user: User
  ): Promise<{ token: string }> {
    const { token } = await this.usersService.signIn(user);
    session.set(SESSION_ACCESS_TOKEN, token);
    return { token };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('sign-out')
  signOut(@Session() session: FastifySession): Record<string, unknown> {
    session.delete();
    return this.usersService.signOut();
  }

  @UseGuards(JwtAuthGuard)
  @Get('current-user')
  getCurrentUser(@CurrentUser() user: User): User {
    return user;
  }
}
