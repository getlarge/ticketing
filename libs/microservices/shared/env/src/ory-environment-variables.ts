import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { decorate } from 'ts-mixer';

export class OryKratosEnvironmentVariables {
  @decorate(Expose())
  @decorate(
    IsUrl({
      require_protocol: true,
      require_valid_protocol: true,
      require_host: true,
      require_tld: false,
    }),
  )
  @decorate(IsOptional())
  ORY_KRATOS_ADMIN_URL?: string = 'http://localhost:4434';

  @decorate(Expose())
  @decorate(
    IsUrl({
      require_protocol: true,
      require_valid_protocol: true,
      require_host: true,
      require_tld: false,
    }),
  )
  @decorate(IsOptional())
  ORY_KRATOS_PUBLIC_URL?: string = 'http://localhost:4433';

  @decorate(Expose())
  @decorate(IsString())
  @decorate(IsOptional())
  ORY_KRATOS_API_KEY?: string;
}

export class OryHydraEnvironmentVariables {
  @decorate(Expose())
  @decorate(
    IsUrl({
      require_protocol: true,
      require_valid_protocol: true,
      require_host: true,
      require_tld: false,
    }),
  )
  @decorate(IsOptional())
  ORY_HYDRA_ADMIN_URL?: string = 'http://localhost:4445';

  @decorate(Expose())
  @decorate(
    IsUrl({
      require_protocol: true,
      require_valid_protocol: true,
      require_host: true,
      require_tld: false,
    }),
  )
  @decorate(IsOptional())
  ORY_HYDRA_PUBLIC_URL?: string = 'http://localhost:4444';

  @decorate(Expose())
  @decorate(IsString())
  @decorate(IsOptional())
  ORY_HYDRA_API_KEY?: string;
}

export class OryKetoEnvironmentVariables {
  @decorate(Expose())
  @decorate(
    IsUrl({
      require_protocol: true,
      require_valid_protocol: true,
      require_host: true,
      require_tld: false,
    }),
  )
  ORY_KETO_ADMIN_URL?: string = 'http://localhost:4467';

  @decorate(Expose())
  @decorate(
    IsUrl({
      require_protocol: true,
      require_valid_protocol: true,
      require_host: true,
      require_tld: false,
    }),
  )
  ORY_KETO_PUBLIC_URL?: string = 'http://localhost:4466';

  @decorate(Expose())
  @decorate(IsString())
  @decorate(IsOptional())
  ORY_KETO_API_KEY?: string;
}

export class OryActionEnvironmentVariables {
  // should be set in the HTTP header x-ory-api-key from the action webhook
  @decorate(Expose())
  @decorate(IsString())
  ORY_ACTION_API_KEY?: string = '';
}
