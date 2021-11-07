import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Actions, Resources } from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import type { FastifyRequest } from 'fastify';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { User, UserCredentialsDto } from './models';
import { UserCredentials } from './models/user-credentials';
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
    // type: UserResponseDto,
  })
  @Post('sign-up')
  signUp(@Body() user: UserCredentials): Promise<UserCredentials> {
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
  @Post('sign-in')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'JWT Token',
  })
  async signIn(
    @Body() _user: UserCredentials,
    @Request() request: FastifyRequest & { user: User & { id: string } }
  ) {
    const { token } = await this.usersService.signIn(request.user);
    request.session.set('token', token);
    return { token };
  }

  @UseGuards(JwtAuthGuard)
  @Post('sign-out')
  signOut() {
    return this.usersService.signOut();
  }

  @UseGuards(JwtAuthGuard)
  @Get('current-user')
  getCurrentUser() {
    return this.usersService.getCurrentUser();
  }
}
