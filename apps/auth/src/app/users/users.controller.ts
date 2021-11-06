import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Resources } from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';

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
  @Post('sign-up')
  signup(@Body() user: CreateUser) {
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
