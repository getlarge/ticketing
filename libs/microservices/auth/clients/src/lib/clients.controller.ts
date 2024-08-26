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
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@ticketing/microservices/auth/users';
import { SecurityRequirements } from '@ticketing/microservices/shared/constants';
import {
  CurrentClient,
  CurrentUser,
} from '@ticketing/microservices/shared/decorators';
import {
  OryActionAuthGuard,
  OryAuthenticationGuard,
  OryOAuth2AuthenticationGuard,
} from '@ticketing/microservices/shared/guards';
import { Actions, Resources } from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';

import { ClientsService } from './clients.service';
import {
  Client,
  ClientDto,
  CreateClientDto,
  CreatedClientDto,
  OryOAuth2WebhookPayloadDto,
  OryOAuth2WebhookResponseDto,
} from './models';

@Controller(Resources.CLIENTS)
@ApiTags(Resources.CLIENTS)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @UseGuards(OryAuthenticationGuard())
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
    }),
  )
  @ApiOperation({
    description: 'Register a new client',
    summary: `Register a new client - Scope : ${Resources.CLIENTS}:${Actions.CREATE_ONE}`,
  })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Client created',
    type: CreatedClientDto,
  })
  @Post('')
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: User,
    @Body() body: CreateClientDto,
  ): Promise<CreatedClientDto> {
    return this.clientsService.create(body, user);
  }

  @UseGuards(OryActionAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
    }),
  )
  @ApiOperation({
    description: 'Triggered when a client request an OAuth2 token',
  })
  @ApiBody({ type: OryOAuth2WebhookPayloadDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token session update',
    type: OryOAuth2WebhookResponseDto,
  })
  @Post('on-token-request')
  @HttpCode(HttpStatus.OK)
  onSignUp(
    @Body() body: OryOAuth2WebhookPayloadDto,
  ): Promise<OryOAuth2WebhookResponseDto> {
    return this.clientsService.onTokenRequest(body);
  }

  @UseGuards(OryOAuth2AuthenticationGuard())
  @ApiOperation({
    description: 'Get details about currently authenticated client',
    summary: `Get current client - Scope : ${Resources.CLIENTS}:${Actions.READ_ONE}`,
  })
  @ApiBearerAuth(SecurityRequirements.Bearer)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Current client authenticated',
    type: ClientDto,
  })
  @Get('current-client')
  getCurrentClient(@CurrentClient() client: Client): Client {
    return client;
  }
}
