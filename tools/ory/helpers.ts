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
import dotenv from 'dotenv';
import { load, dump } from 'js-yaml';
import { constants, accessSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

interface KeywordMappings {
  [key: string]: (string | number)[] | string | number;
}

const isUrlOptions: Parameters<typeof IsUrl>[0] = {
  require_tld: false,
  require_protocol: true,
  require_valid_protocol: true,
  protocols: ['http', 'https'],
};

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export const ORY_KRATOS_DIRECTORY = join(
  __dirname,
  '..',
  '..',
  'infra',
  'ory',
  'kratos',
);

export class KratosMappings implements KeywordMappings {
  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_ui_base_url?: string;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_settings_ui_url?: string;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_verification_ui_url?: string;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_recovery_ui_url?: string;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_login_ui_url?: string;

  @Expose()
  @IsOptional()
  @IsUrl(isUrlOptions)
  selfservice_flows_registration_ui_url?: string;

  @Expose()
  @IsOptional()
  @IsUrl({
    require_tld: false,
    require_protocol: true,
    require_valid_protocol: true,
    protocols: ['http', 'https'],
  })
  selfservice_browser_default_return_to?: string;

  @Expose()
  @IsOptional()
  @Transform(
    ({ value }) => (value ? value.split(',').map((v) => v.trim()) : []),
    { toClassOnly: true },
  )
  @IsArray()
  @IsUrl(isUrlOptions, { each: true })
  selfservice_allowed_return_urls?: string[];

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

  [key: string]: (string | number)[] | string | number | undefined;
}

function validateMappings<T extends object>(
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

function keywordArrayReplace(input: string, mappings: KeywordMappings) {
  Object.keys(mappings).forEach(function (key) {
    // Matching against two sets of patterns because a developer may provide their array replacement keyword with or without wrapping quotes. It is not obvious to the developer which to do depending if they're operating in YAML or JSON.
    const pattern = `@@${key}@@`;
    const patternWithQuotes = `"${pattern}"`;
    const regex = new RegExp(`${patternWithQuotes}|${pattern}`, 'g');
    input = input.replace(regex, JSON.stringify(mappings[key]));
  });
  return input;
}

function keywordStringReplace(input: string, mappings: KeywordMappings) {
  Object.keys(mappings).forEach(function (key) {
    const regex = new RegExp(`##${key}##`, 'g');
    const mapping = mappings[key];
    if (typeof mapping === 'string') {
      input = input.replace(regex, mapping);
    }
  });
  return input;
}
function keywordReplace(input: string, mappings: KeywordMappings) {
  // Replace keywords with mappings within input.
  if (mappings && Object.keys(mappings).length > 0) {
    input = keywordArrayReplace(input, mappings);
    input = keywordStringReplace(input, mappings);
  }
  return input;
}

export function loadFileAndReplaceKeywords(
  file: string,
  mappings: KeywordMappings,
) {
  const f = resolve(file);
  try {
    accessSync(f, constants.F_OK);
    if (mappings) {
      return keywordReplace(readFileSync(f, 'utf8'), mappings);
    }
    return readFileSync(f, 'utf8');
  } catch (error) {
    throw new Error(`Unable to load file ${f} due to ${error}`);
  }
}

export function getOryKratosConfig<M extends KeywordMappings>(
  configFilepath: string,
  mappings?: M,
): Record<string, unknown> {
  const oryConfigString = loadFileAndReplaceKeywords(configFilepath, mappings);
  return load(oryConfigString) as Record<string, unknown>;
}

export function getOryKratosMappings(envFilePath: string): KratosMappings {
  const processEnv: Record<string, string> = {};
  dotenv.config({ path: envFilePath, processEnv });
  return validateMappings(KratosMappings, processEnv);
}

export function generateOryKratosConfig(
  envFilePath: string = join(ORY_KRATOS_DIRECTORY, '.env'),
  configFilepath: string = join(ORY_KRATOS_DIRECTORY, 'config.yaml'),
  outputFilePath: string = join(ORY_KRATOS_DIRECTORY, 'kratos.yaml'),
): void {
  const mappings = getOryKratosMappings(envFilePath);
  const config = getOryKratosConfig(configFilepath, mappings);
  const yaml = dump(config, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: true,
    quotingType: '"',
  });
  writeFileSync(outputFilePath, yaml);
}
