import { Expose } from 'class-transformer';
import { IsString, IsUrl } from 'class-validator';
import { decorate } from 'ts-mixer';

export class OryEnvironmentVariables {
  @decorate(Expose())
  @decorate(
    IsUrl({
      require_protocol: true,
      require_valid_protocol: true,
      require_host: true,
      require_tld: true,
    })
  )
  ORY_BASE_PATH: `https://${string}.projects.oryapis.com`;

  @decorate(Expose())
  @decorate(IsString())
  ORY_API_KEY: string;
}

export class OryActionEnvironmentVariables {
  @decorate(Expose())
  @decorate(IsString())
  // should be set in the HTTP header x-ory-api-key from the action webhook
  ORY_ACTION_API_KEY: string;
}
