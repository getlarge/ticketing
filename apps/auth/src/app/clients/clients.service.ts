import { OryOAuth2Service } from '@getlarge/hydra-client-wrapper';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { inspect } from 'util';

import { User } from '../users/models';
import {
  Client,
  CreateClientDto,
  OryOAuth2WebhookPayloadDto,
  OryOAuth2WebhookResponseDto,
} from './models';
import { Client as ClientSchema, ClientDocument } from './schemas';

@Injectable()
export class ClientsService {
  readonly logger = new Logger(ClientsService.name);

  constructor(
    @Inject(OryOAuth2Service)
    private readonly oryOAuth2Service: OryOAuth2Service,
    @InjectModel(ClientSchema.name)
    private readonly clientModel: Model<ClientDocument>,
  ) {}

  async create(body: CreateClientDto, user: User): Promise<Client> {
    const { scope = 'offline' } = body;
    const { data: oryClient } = await this.oryOAuth2Service.createOAuth2Client({
      oAuth2Client: {
        owner: user.id,
        access_token_strategy: 'opaque',
        grant_types: ['client_credentials'],
        scope,
      },
    });
    const client = await this.clientModel.create({
      clientId: oryClient.client_id,
      user: Types.ObjectId.createFromHexString(user.id),
    });
    return client.toJSON<Client>();
  }

  /**
   * @see https://www.ory.sh/docs/hydra/guides/claims-at-refresh#updated-tokens
   **/
  async onTokenRequest(
    body: OryOAuth2WebhookPayloadDto,
  ): Promise<OryOAuth2WebhookResponseDto> {
    this.logger.debug(`onTokenRequest`, inspect(body, { depth: null }));
    const clientId = body.session.client_id;
    const existingClient = await this.clientModel
      .findOne({
        clientId,
      })
      .populate('user');
    if (!existingClient) {
      throw new HttpException(
        `Client ${clientId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      session: {
        access_token: {
          clientId: existingClient.id,
          userId: existingClient.user._id.toString(),
          userEmail: existingClient.user.email,
          userIdentityId: existingClient.user.identityId,
        },
      },
    };
  }
}
