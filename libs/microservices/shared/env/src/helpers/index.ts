import { Environment } from '@ticketing/shared/constants';
import { config, parse } from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { existsSync, readFileSync } from 'fs';
import { resolve as pathResolve } from 'path';

// helpers that can be called before configService init

function getEnvFilePath(): string {
  return process.env.NODE_ENV === Environment.Test ? '.env.test' : '.env';
}

export function getNodeEnv(envFilePath?: string): Environment {
  const filePath = envFilePath || getEnvFilePath();
  config({ path: pathResolve(process.cwd(), filePath) });
  return process.env.NODE_ENV as Environment;
}

export function getMaxWorkers(): number {
  // config({ path: pathResolve(process.cwd(), '.env') });
  const concurrency = +process.env.WEB_CONCURRENCY;
  return isNaN(concurrency) ? 0 : concurrency;
}

export function getClusterEnabled(envFilePath?: string): boolean {
  const filePath = envFilePath || getEnvFilePath();
  config({ path: pathResolve(process.cwd(), filePath) });
  const clusterEnabled = process.env.CLUSTER_ENABLED;
  return strToBool(clusterEnabled);
}

export function getBrokerUrl(envFilePath?: string): string {
  const filePath = envFilePath || getEnvFilePath();
  const env = config({ path: pathResolve(process.cwd(), filePath) });
  dotenvExpand(env);
  return process.env.BROKER_URL;
}

export function strToBool(val?: string | boolean): boolean {
  return val && (val === 'true' || val === true) ? true : false;
}

export function loadEnv(
  envFilePath: string,
  overrideProcessEnv = false
): NodeJS.ProcessEnv {
  const variables = existsSync(envFilePath)
    ? parse(readFileSync(envFilePath))
    : {};
  if (overrideProcessEnv) {
    Object.entries(variables).forEach(([name, value]) => {
      if (process.env[name] && process.env[name] !== value) {
        delete process.env[name];
      }
    });
  }
  const env =
    envFilePath && typeof envFilePath === 'string'
      ? config({ path: pathResolve(envFilePath) })
      : config();
  dotenvExpand(env);
  const { parsed, error } = env;
  const sourceEnv = error ? process.env : parsed;
  return overrideProcessEnv ? { ...sourceEnv, ...variables } : sourceEnv;
}
