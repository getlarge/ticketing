import { ConfigService } from '@nestjs/config';
import {
  BaseEnvironmentVariables,
  MongoEnvironmentVariables,
  OryHydraEnvironmentVariables,
  OryKetoEnvironmentVariables,
  OryKratosEnvironmentVariables,
  RedisEnvironmentVariables,
  RmqEnvironmentVariables,
} from '@ticketing/microservices/shared/env';
import { Exclude } from 'class-transformer';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Mixin } from 'ts-mixer';

import { ModerationEnvironmentVariables } from './moderation-environment-variables';

export type AppConfigService = ConfigService<EnvironmentVariables, true>;

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, '..', '..', '..', '..', '..', 'package.json');

class OryEnvironmentVariables extends Mixin(
  OryHydraEnvironmentVariables,
  OryKetoEnvironmentVariables,
  OryKratosEnvironmentVariables,
) {}

export class EnvironmentVariables extends Mixin(
  BaseEnvironmentVariables,
  ModerationEnvironmentVariables,
  MongoEnvironmentVariables,
  RedisEnvironmentVariables,
  RmqEnvironmentVariables,
  OryEnvironmentVariables,
) {
  @Exclude()
  private pkg: { [key: string]: unknown; name?: string; version?: string } =
    JSON.parse(readFileSync(pkgPath, 'utf8'));

  APP_NAME?: string = 'moderation';

  APP_VERSION?: string = this.pkg?.version || '0.0.1';
}
