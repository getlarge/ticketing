import 'reflect-metadata';
import {
  ClassConstructor,
  Expose,
  Transform,
  plainToClass,
} from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  validateSync,
} from 'class-validator';

export class KeywordMappings {
  @Expose()
  @IsOptional()
  @IsString()
  log_level?: string = 'debug';

  [key: string]: (string | number)[] | string | number | boolean;
}

const isUrlOptions: Parameters<typeof IsUrl>[0] = {
  require_tld: false,
  require_protocol: true,
  require_valid_protocol: true,
  protocols: ['http', 'https'],
};

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const DEFAULT_SELF_SERVICE_UI_URL = 'http://localhost:4455';

const strToBool = (value: string | boolean) =>
  value === 'true' || value === true;

export class KratosMappings extends KeywordMappings {
  @Expose()
  @IsOptional()
  @IsString()
  courier_smtp_from_name?: string = 'Ticketing';

  @Expose()
  @IsOptional()
  @IsUrl({
    require_tld: false,
    require_protocol: true,
    require_valid_protocol: true,
    protocols: ['smtp', 'smtps'],
  })
  courier_smtp_connection_uri?: string =
    'smtps://test:test@mailslurper:1025/?skip_ssl_verify=true';

  @Expose()
  @IsOptional()
  @IsString()
  kratos_dsn?: string = 'memory';

  @Expose()
  @IsOptional()
  @IsString()
  identity_schemas_default?: string =
    'file:///etc/config/kratos/identity.schema.json';

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_ui_base_url?: string = DEFAULT_SELF_SERVICE_UI_URL;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_errors_ui_url?: string =
    `${DEFAULT_SELF_SERVICE_UI_URL}/error`;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_settings_ui_url?: string =
    `${DEFAULT_SELF_SERVICE_UI_URL}/settings`;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_verification_ui_url?: string =
    `${DEFAULT_SELF_SERVICE_UI_URL}/verification`;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_recovery_ui_url?: string =
    `${DEFAULT_SELF_SERVICE_UI_URL}/recovery`;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_login_ui_url?: string =
    `${DEFAULT_SELF_SERVICE_UI_URL}/login`;

  @Expose()
  @Transform(({ obj, key }) => strToBool(obj[key]), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsBoolean()
  selfservice_flows_login_after_hook_config_can_interrupt?: boolean = false;

  @Expose()
  @Transform(({ obj, key }) => strToBool(obj[key]), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsBoolean()
  selfservice_flows_login_after_hook_config_response_ignore?: boolean = false;

  @Expose()
  @Transform(({ obj, key }) => strToBool(obj[key]), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsBoolean()
  selfservice_flows_login_after_hook_config_response_parse?: boolean = false;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_registration_ui_url?: string =
    `${DEFAULT_SELF_SERVICE_UI_URL}/register`;

  @Expose()
  @Transform(({ obj, key }) => strToBool(obj[key]), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsBoolean()
  selfservice_flows_registration_after_hook_config_can_interrupt?: boolean =
    false;

  @Expose()
  @Transform(({ obj, key }) => strToBool(obj[key]), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsBoolean()
  selfservice_flows_registration_after_hook_config_response_ignore?: boolean =
    false;

  @Expose()
  @Transform(({ obj, key }) => strToBool(obj[key]), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsBoolean()
  selfservice_flows_registration_after_hook_config_response_parse?: boolean =
    false;

  @Expose()
  @IsOptional()
  @IsUrl({
    require_tld: false,
    require_protocol: true,
    require_valid_protocol: true,
    protocols: ['http', 'https'],
  })
  selfservice_default_browser_return_url?: string;

  @Expose()
  @IsOptional()
  @Transform(
    ({ value }) => (value ? value.split(',').map((v) => v.trim()) : []),
    { toClassOnly: true },
  )
  @IsArray()
  @IsUrl(isUrlOptions, { each: true })
  selfservice_allowed_return_urls?: string[] = [];

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_login_after_hook_config_url?: string;

  @Expose()
  @IsOptional()
  @IsIn(httpMethods)
  selfservice_flows_login_after_hook_config_method?: string = 'POST';

  @Expose()
  @IsOptional()
  @IsString()
  selfservice_flows_login_after_hook_config_body?: string =
    'file:///etc/config/kratos/after-login.jsonnet';

  @Expose()
  @IsOptional()
  @IsString()
  selfservice_flows_login_after_hook_config_auth_config_value?: string;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_settings_after_hook_config_url?: string;

  @Expose()
  @IsOptional()
  @IsString()
  selfservice_flows_settings_after_hook_config_body?: string =
    'file:///etc/config/kratos/after-login.jsonnet';

  @Expose()
  @IsOptional()
  @IsIn(httpMethods)
  selfservice_flows_settings_after_hook_config_method?: string = 'POST';

  @Expose()
  @IsOptional()
  @IsString()
  selfservice_flows_settings_after_hook_config_auth_config_value?: string;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_registration_after_hook_config_url?: string;

  @Expose()
  @IsOptional()
  @IsString()
  selfservice_flows_registration_after_hook_config_body?: string =
    'file:///etc/config/kratos/after-login.jsonnet';

  @Expose()
  @IsOptional()
  @IsIn(httpMethods)
  selfservice_flows_registration_after_hook_config_method?: string = 'POST';

  @Expose()
  @IsOptional()
  @IsString()
  selfservice_flows_registration_after_hook_config_auth_config_value?: string;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_verification_after_hook_config_url?: string;

  @Expose()
  @IsOptional()
  @IsString()
  selfservice_flows_verification_after_hook_config_auth_config_value?: string;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  oauth2_provider_url?: string = 'http://localhost:4445/';

  @Expose()
  @IsOptional()
  @IsString()
  @Length(16)
  secrets_cookie?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @Length(32, 32)
  secrets_cipher?: string;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  serve_public_base_url?: string = 'http://localhost:4433/';

  @Expose()
  @Transform(({ obj, key }) => obj[key] === 'true' || obj[key] === true, {
    toClassOnly: true,
  })
  @IsOptional()
  @IsBoolean()
  serve_public_cors_enabled?: boolean = false;

  @Expose()
  @Transform(
    ({ value }) => (value ? value.split(',').map((v) => v.trim()) : []),
    { toClassOnly: true },
  )
  @IsOptional()
  @IsString({ each: true })
  serve_public_cors_allowed_origins?: string[] = [
    'http://localhost:4200',
    'http://localhost:4433',
    'http://localhost:4455',
    'http://localhost:8080',
  ];

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  serve_admin_base_url?: string = 'http://kratos:4434/';

  @Expose()
  @IsOptional()
  @IsString()
  session_cookie_domain?: string = 'localhost';

  @Expose()
  @IsOptional()
  @IsString()
  session_cookie_name?: string = 'ory_kratos_session';
}

export class HydraMappings extends KeywordMappings {
  @Expose()
  @IsOptional()
  @IsString()
  hydra_dsn?: string = 'memory';

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  urls_self_issuer?: string = 'http://localhost:4444';

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  urls_self_public = 'http://localhost:4444';

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  urls_consent?: string = `${DEFAULT_SELF_SERVICE_UI_URL}/consent`;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  urls_login?: string = `${DEFAULT_SELF_SERVICE_UI_URL}/login`;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  urls_logout?: string = `${DEFAULT_SELF_SERVICE_UI_URL}/logout`;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  urls_identity_provider_publicUrl?: string = 'http://localhost:4433';

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  urls_identity_provider_url?: string = 'http://kratos:4434';

  @Expose()
  @IsOptional()
  @IsString()
  secrets_system?: string;

  @Expose()
  @IsOptional()
  @IsString()
  oidc_subject_identifiers_pairwise_salt?: string;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  oauth2_token_hook_url?: string;

  @Expose()
  @IsOptional()
  @IsString()
  oauth2_token_hook_auth_config_value?: string;
}

export class KetoMappings extends KeywordMappings {
  @Expose()
  @IsOptional()
  @IsString()
  namespaces_location?: string = 'file:///home/ory/namespaces.ts';

  @Expose()
  @IsOptional()
  @IsString()
  keto_dsn?: string = 'memory';
}

export class OathkeeperMappings extends KeywordMappings {
  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  kratos_public_url?: string = 'http://kratos:4433/';

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  oathkeeper_public_url?: string = 'http://localhost:4455/';

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_ui_url?: string = 'http://kratos-selfservice-ui-node:3000/';

  //

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  errors_handlers_redirect_config_to?: string =
    `${DEFAULT_SELF_SERVICE_UI_URL}/login`;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  authenticators_cookie_session_config_check_session_url?: string =
    'http://kratos:4433/sessions/whoami';

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  mutators_id_token_config_issuer_url?: string = DEFAULT_SELF_SERVICE_UI_URL;
}

export function validateMappings<T extends object>(
  mappings: ClassConstructor<T>,
  processEnv: Record<string, string>,
) {
  const validatedConfig = plainToClass(mappings, processEnv, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
    exposeDefaultValues: true,
    exposeUnsetFields: false,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    forbidUnknownValues: true,
    whitelist: true,
    validationError: {
      target: false,
    },
  });
  if (errors.length > 0) {
    throw new Error(JSON.stringify(errors, null, 2));
  }
  return validatedConfig;
}
