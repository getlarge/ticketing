import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Actions, Resources } from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';

import { CreateUserDto } from './models';
import { CreateUser } from './models/create-user';
import { UsersService } from './users.service';

@Controller(Resources.USERS)
@ApiTags(Resources.USERS)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('current-user')
  getCurrentUser() {
    return this.usersService.getCurrentUser();
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
      whitelist: true,
    })
  )
  @ApiOperation({
    description: 'Request creation of a user',
    summary: `Register a user - Scope : ${Resources.USERS}:${Actions.CREATE_ONE}`,
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created',
    // type: UserResponseDto,
  })
  @Post('sign-up')
  signup(@Body() user: CreateUser): Promise<CreateUser> {
    return this.usersService.signUp(user);
  }

  @Post('sign-in')
  signin(@Body() user: CreateUser) {
    return this.usersService.signIn(user);
  }

  @Post('sign-out')
  signout() {
    return this.usersService.signOut();
  }
}
