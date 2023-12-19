import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  Configuration,
  FrontendApi,
  Identity,
  IdentityApi,
  JsonPatchOpEnum,
  OAuth2Api,
  OAuth2Client,
  Session,
} from '@ory/client';
import { CURRENT_USER_KEY } from '@ticketing/shared/constants';
import type { FastifyRequest } from 'fastify/types/request';

import { OryAuthenticationModuleOptions } from './ory.interfaces';

@Injectable()
export class OryAuthenticationService {
  readonly logger = new Logger(OryAuthenticationService.name);
  private readonly identityApi: IdentityApi;
  private readonly oauth2Api: OAuth2Api;
  private readonly frontendApi: FrontendApi;

  constructor(
    @Inject(OryAuthenticationModuleOptions)
    options: OryAuthenticationModuleOptions,
  ) {
    const {
      kratosAccessToken,
      kratosAdminApiPath,
      kratosPublicApiPath,
      hydraAccessToken,
      hydraPublicApiPath,
    } = options;
    this.frontendApi = new FrontendApi(
      new Configuration({
        basePath: kratosPublicApiPath,
      }),
    );
    this.identityApi = new IdentityApi(
      new Configuration({
        basePath: kratosAdminApiPath,
        accessToken: kratosAccessToken,
      }),
    );
    this.oauth2Api = new OAuth2Api(
      new Configuration({
        basePath: hydraPublicApiPath,
        accessToken: hydraAccessToken,
      }),
    );
  }

  // #region Frontend API

  private isValidSession(x: Session): x is Session & {
    identity: { metadata_public: { id: string } };
  } {
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
  }

  async validateSession(request: FastifyRequest): Promise<boolean> {
    const authHeader = request.headers.authorization;
    const hasAuthHeader =
      typeof authHeader === 'string' &&
      authHeader &&
      authHeader?.startsWith('Bearer ');
    const sessionToken = hasAuthHeader
      ? authHeader.slice(7, authHeader.length)
      : undefined;

    try {
      const { data: session } = await this.frontendApi.toSession({
        cookie: request.headers.cookie,
        xSessionToken: sessionToken,
      });
      if (!this.isValidSession(session)) {
        this.logger.error('Invalid session', session);
        return false;
      }
      Object.defineProperty(request, CURRENT_USER_KEY, {
        value: {
          identityId: session.identity.id,
          id: session.identity.metadata_public.id,
          email: session.identity.traits.email,
        },
      });
      return !!session?.identity;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  // #endregion

  // #region Identity API
  async updateIdentityMetadata(
    identityId: string,
    metadata: Identity['metadata_public'],
  ): Promise<Identity> {
    const response = await this.identityApi.patchIdentity({
      id: identityId,
      jsonPatch: [
        {
          op: JsonPatchOpEnum.Replace,
          value: metadata,
          path: '/metadata_public',
        },
      ],
    });
    return response.data;
  }

  async getIdentity(identityId: string): Promise<Identity> {
    const { data } = await this.identityApi.getIdentity({ id: identityId });
    return data;
  }

  async toggleIdentityState(
    identityId: string,
    state: 'active' | 'inactive',
  ): Promise<Identity> {
    const response = await this.identityApi.patchIdentity({
      id: identityId,
      jsonPatch: [
        {
          op: JsonPatchOpEnum.Replace,
          value: state,
          path: '/state',
        },
      ],
    });
    return response.data;
  }

  async deleteIdentity(identityId: string): Promise<void> {
    await this.identityApi.deleteIdentity({ id: identityId });
  }

  async signOut(sessionId: string): Promise<void> {
    await this.identityApi.disableSession({
      id: sessionId,
    });
  }

  // #endregion

  // #region OAuth2 API
  // TODO: allow users to create their own M2M clients
  async createClient(
    userId: string,
    scope: string = 'openid offline',
  ): Promise<OAuth2Client> {
    const response = await this.oauth2Api.createOAuth2Client({
      oAuth2Client: {
        client_name: `client-${userId}`,
        // audience: ['my api url'],
        grant_types: ['client_credentials'],
        response_types: ['token'],
        scope,
        token_endpoint_auth_method: 'client_secret_post',
        metadata: {
          user_id: userId,
        },
      },
    });
    return response.data;
  }

  async getClient(clientId: string): Promise<OAuth2Client> {
    const response = await this.oauth2Api.getOAuth2Client({ id: clientId });
    return response.data;
  }

  // #endregion
}
