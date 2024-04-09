/* eslint-disable @typescript-eslint/naming-convention */

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmptyObject,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class OryOAuth2WebhookPayloadIDTokenClaims {
  @IsString()
  jti: string;

  @IsString()
  iss: string;

  @IsString()
  sub: string;

  @ValidateIf((object, value) => value != null)
  @IsArray()
  @IsString({ each: true })
  aud: string[] | null;

  @IsString()
  nonce: string;

  @IsString()
  at_hash: string;

  @IsString()
  acr: string;

  @ValidateIf((object, value) => value != null)
  @IsString()
  amr: string | null;

  @IsString()
  c_hash: string;

  ext: object;
}

class OryOAuth2WebhookPayloadIDToken {
  @Type(() => OryOAuth2WebhookPayloadIDTokenClaims)
  @ValidateNested()
  @IsNotEmptyObject()
  id_token_claims: OryOAuth2WebhookPayloadIDTokenClaims;

  headers: {
    extra: object;
  };

  @IsString()
  username: string;

  @IsString()
  subject: string;
}

class OryOAuth2WebhookPayloadSession {
  @Type(() => OryOAuth2WebhookPayloadIDToken)
  @ValidateNested()
  @IsNotEmptyObject()
  id_token: OryOAuth2WebhookPayloadIDToken;

  extra: object;

  @IsString()
  client_id: string;

  @IsString()
  consent_challenge: string;

  @IsBoolean()
  exclude_not_before_claim: boolean;

  @IsArray()
  @IsString({ each: true })
  allowed_top_level_claims: string[];
}

class OryOAuth2WebhookPayloadRequestDto {
  @IsString()
  client_id: string;

  @IsArray()
  @IsString({ each: true })
  granted_scopes: string[];

  @IsArray()
  @IsString({ each: true })
  granted_audience: string[];

  @IsArray()
  @IsString({ each: true })
  grant_types: string[];

  payload: object;
}

/**
 * @see https://www.ory.sh/docs/hydra/guides/claims-at-refresh#webhook-payload
 */
export class OryOAuth2WebhookPayloadDto {
  @Type(() => OryOAuth2WebhookPayloadSession)
  @ValidateNested()
  @IsNotEmptyObject()
  session: OryOAuth2WebhookPayloadSession;

  @Type(() => OryOAuth2WebhookPayloadRequestDto)
  @ValidateNested()
  @IsNotEmptyObject()
  request: OryOAuth2WebhookPayloadRequestDto;
}

/**
 * @see https://www.ory.sh/docs/hydra/guides/claims-at-refresh#webhook-responses
 */
export class OryOAuth2WebhookResponseDto {
  session: {
    access_token?: {
      [key: string]: string;
    };
    id_token?: {
      [key: string]: string;
    };
  };
}
