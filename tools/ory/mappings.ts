import 'reflect-metadata';
import {
  ClassConstructor,
  Expose,
  Transform,
  plainToClass,
} from 'class-transformer';
import {
  IsArray,
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

  [key: string]: (string | number)[] | string | number;
}

const isUrlOptions: Parameters<typeof IsUrl>[0] = {
  require_tld: false,
  require_protocol: true,
  require_valid_protocol: true,
  protocols: ['http', 'https'],
};

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const DEFAULT_SELF_SERVICE_UI_URL = 'http://localhost:4455';

export class KratosMappings extends KeywordMappings {
  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_ui_base_url: string = DEFAULT_SELF_SERVICE_UI_URL;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_errors_ui_url?: string =
    `${this.selfservice_flows_ui_base_url}/error`;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_settings_ui_url?: string =
    `${this.selfservice_flows_ui_base_url}/settings`;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_verification_ui_url?: string =
    `${this.selfservice_flows_ui_base_url}/verification`;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_recovery_ui_url?: string =
    `${this.selfservice_flows_ui_base_url}/recovery`;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_login_ui_url?: string =
    `${this.selfservice_flows_ui_base_url}/login`;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_registration_ui_url?: string =
    `${this.selfservice_flows_ui_base_url}/register`;

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
  selfservice_flows_login_after_hook_config_auth_config_value?: string;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_settings_after_hook_config_url?: string;

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
  @IsOptional()
  @IsUrl(isUrlOptions)
  serve_admin_base_url?: string = 'http://kratos:4434/';
}

export class KetoMappings extends KeywordMappings {}

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
