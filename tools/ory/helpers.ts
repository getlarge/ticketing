import type { ClassConstructor } from 'class-transformer';
import dotenv from 'dotenv';
import { load, dump } from 'js-yaml';
import { constants, accessSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  HydraMappings,
  KetoMappings,
  KeywordMappings,
  KratosMappings,
  OathkeeperMappings,
  validateMappings,
} from './mappings';

export const ORY_INFRA_DIRECTORY = join(__dirname, '..', '..', 'infra', 'ory');
export const ORY_KRATOS_DIRECTORY = join(ORY_INFRA_DIRECTORY, 'kratos');
export const ORY_HYDRA_DIRECTORY = join(ORY_INFRA_DIRECTORY, 'hydra');
export const ORY_KETO_DIRECTORY = join(ORY_INFRA_DIRECTORY, 'keto');
export const ORY_OATHKEEPER_DIRECTORY = join(ORY_INFRA_DIRECTORY, 'oathkeeper');

type ConfigFilepath = `${string}.yml` | `${string}.yaml` | `${string}.json`;

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
    if (
      typeof mapping === 'string' ||
      typeof mapping === 'number' ||
      typeof mapping === 'boolean'
    ) {
      input = input.replace(regex, mapping.toString());
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
  file: ConfigFilepath,
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

export function getOryConfig<M extends KeywordMappings>(
  configFilepath: ConfigFilepath,
  mappings?: M,
): Record<string, unknown> {
  const oryConfigString = loadFileAndReplaceKeywords(configFilepath, mappings);

  if (configFilepath.endsWith('.json')) {
    return JSON.parse(oryConfigString);
  }
  return load(oryConfigString) as Record<string, unknown>;
}

function getOryMappings<T extends KeywordMappings>(
  cls: ClassConstructor<T>,
  envFilePath: string,
): T {
  const processEnv: Record<string, string> = {};
  dotenv.config({ path: envFilePath, processEnv });
  return validateMappings(cls, processEnv);
}

export function getOryHydraMappings(envFilePath: string): HydraMappings {
  return getOryMappings(HydraMappings, envFilePath);
}

export function getOryKratosMappings(envFilePath: string): KratosMappings {
  return getOryMappings(KratosMappings, envFilePath);
}

export function getOryKetoMappings(envFilePath: string): KetoMappings {
  return getOryMappings(KetoMappings, envFilePath);
}

export function getOryOathkeeperMappings(
  envFilePath: string,
): OathkeeperMappings {
  return getOryMappings(OathkeeperMappings, envFilePath);
}

function storeGeneratedOryConfig(
  config: Record<string, unknown>,
  outputFilePath: ConfigFilepath,
) {
  let output: string;
  if (outputFilePath.endsWith('.json')) {
    output = JSON.stringify(config, null, 2);
  } else {
    output = dump(config, {
      lineWidth: 120,
      noRefs: true,
      sortKeys: true,
      quotingType: '"',
    });
  }
  writeFileSync(outputFilePath, output);
}

export function generateOryKratosConfig(
  envFilePath: string = join(ORY_KRATOS_DIRECTORY, '.env'),
  configFilepath: ConfigFilepath = join(
    ORY_KRATOS_DIRECTORY,
    'kratos-template.yaml',
  ) as ConfigFilepath,
  outputFilePath: ConfigFilepath = join(
    ORY_KRATOS_DIRECTORY,
    'kratos.yaml',
  ) as ConfigFilepath,
): void {
  const mappings = getOryKratosMappings(envFilePath);
  const config = getOryConfig(configFilepath, mappings);
  storeGeneratedOryConfig(config, outputFilePath);
}

export function generateOryHydraConfig(
  envFilePath: string = join(ORY_HYDRA_DIRECTORY, '.env'),
  configFilepath: ConfigFilepath = join(
    ORY_HYDRA_DIRECTORY,
    'hydra-template.yaml',
  ) as ConfigFilepath,
  outputFilePath: ConfigFilepath = join(
    ORY_HYDRA_DIRECTORY,
    'hydra.yaml',
  ) as ConfigFilepath,
): void {
  const mappings = getOryHydraMappings(envFilePath);
  const config = getOryConfig(configFilepath, mappings);
  storeGeneratedOryConfig(config, outputFilePath);
}

export function generateOryKetoConfig(
  envFilePath: string = join(ORY_KETO_DIRECTORY, '.env'),
  configFilepath: ConfigFilepath = join(
    ORY_KETO_DIRECTORY,
    'keto-template.yaml',
  ) as ConfigFilepath,
  outputFilePath: ConfigFilepath = join(
    ORY_KETO_DIRECTORY,
    'keto.yaml',
  ) as ConfigFilepath,
): void {
  const mappings = getOryKetoMappings(envFilePath);
  const config = getOryConfig(configFilepath, mappings);
  storeGeneratedOryConfig(config, outputFilePath);
}

export function generateOryOathkeeperConfig(
  envFilePath: string = join(ORY_OATHKEEPER_DIRECTORY, '.env'),
  configFilepath: ConfigFilepath = join(
    ORY_OATHKEEPER_DIRECTORY,
    'oathkeeper-template.yaml',
  ) as ConfigFilepath,
  outputFilePath: ConfigFilepath = join(
    ORY_OATHKEEPER_DIRECTORY,
    'oathkeeper.yaml',
  ) as ConfigFilepath,
): void {
  const mappings = getOryOathkeeperMappings(envFilePath);
  const config = getOryConfig(configFilepath, mappings);
  storeGeneratedOryConfig(config, outputFilePath);

  const rules = getOryConfig(
    join(ORY_OATHKEEPER_DIRECTORY, 'rules-template.json') as ConfigFilepath,
    mappings,
  );
  storeGeneratedOryConfig(
    rules,
    join(ORY_OATHKEEPER_DIRECTORY, 'rules.json') as ConfigFilepath,
  );
}
