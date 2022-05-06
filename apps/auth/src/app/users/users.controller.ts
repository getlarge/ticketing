import type { Session as FastifySession } from '@fastify/secure-session';
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SecurityRequirements } from '@ticketing/microservices/shared/constants';
import { CurrentUser } from '@ticketing/microservices/shared/decorators';
import { JwtAuthGuard } from '@ticketing/microservices/shared/guards';
import {
  Actions,
  Resources,
  SESSION_ACCESS_TOKEN,
} from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';

import { LocalAuthGuard } from '../guards/local-auth.guard';
import { User, UserCredentials, UserCredentialsDto, UserDto } from './models';
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
  signUp(@Body() credentials: UserCredentials): Promise<User> {
    return this.usersService.signUp(credentials);
  }

  @UseGuards(LocalAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
    })
  )
  @ApiOperation({
    description: 'Sign in as registered user',
    summary: `Sign in - Scope : ${Resources.USERS}:${Actions.SIGN_IN}`,
  })
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
    @Body() _credentials: UserCredentials,
    @Session() session: FastifySession,
    @CurrentUser() user: User
  ): Promise<{ token: string }> {
    const { token } = await this.usersService.signIn(user);
    session.set(SESSION_ACCESS_TOKEN, token);
    return { token };
  }

  // @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Sign out as signed in user',
    summary: `Sign out - Scope : ${Resources.USERS}:${Actions.SIGN_OUT}`,
  })
  @ApiBearerAuth(SecurityRequirements.Bearer)
  @ApiCookieAuth(SecurityRequirements.Session)
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('sign-out')
  signOut(@Session() session: FastifySession): { success: boolean } {
    session.delete();
    return this.usersService.signOut();
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Get details about currently signed in user',
    summary: `Get current user - Scope : ${Resources.USERS}:${Actions.READ_ONE}`,
  })
  @ApiBearerAuth(SecurityRequirements.Bearer)
  @ApiCookieAuth(SecurityRequirements.Session)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Current user logged in',
    type: UserDto,
  })
  @Get('current-user')
  getCurrentUser(@CurrentUser() user: User): User {
    return user;
  }
}
