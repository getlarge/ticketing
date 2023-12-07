import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import {
  OryActionAuthGuard,
  OryAuthGuard,
} from '@ticketing/microservices/shared/guards';
import { Actions, Resources } from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';

import { User, UserCredentials, UserCredentialsDto, UserDto } from './models';
import { OnOrySignInDto, OnOrySignUpDto } from './models/ory-identity.dto';
import { UsersService } from './users.service';

@Controller(Resources.USERS)
@ApiTags(Resources.USERS)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(OryActionAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
    })
  )
  @ApiOperation({
    description: 'Triggered when a user is created in Ory',
    summary: `Register a user - Scope : ${Resources.USERS}:${Actions.CREATE_ONE}`,
  })
  @ApiBody({ type: OnOrySignUpDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User created',
    type: OnOrySignUpDto,
  })
  @Post('on-sign-up')
  @HttpCode(HttpStatus.OK)
  onSignUp(@Body() body: OnOrySignUpDto): Promise<OnOrySignUpDto> {
    return this.usersService.onSignUp(body);
  }

  @UseGuards(OryActionAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
    })
  )
  @ApiOperation({
    description: 'Triggered when a user signed in via Ory',
    summary: `Login a user - Scope : ${Resources.USERS}:${Actions.SIGN_IN}`,
  })
  @ApiBody({ type: OnOrySignInDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in',
    type: OnOrySignInDto,
  })
  @Post('on-sign-in')
  @HttpCode(HttpStatus.OK)
  onSignIn(@Body() body: OnOrySignInDto): Promise<OnOrySignInDto> {
    return this.usersService.onSignIn(body);
  }

  /**
   * @deprecated Account creation is now handled by Ory and the backend is only involved during the on-sign-up webhook
   */
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

  @UseGuards(OryAuthGuard)
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
