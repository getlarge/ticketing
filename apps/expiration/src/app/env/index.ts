import { ConfigService } from '@nestjs/config';
import {
  BaseEnvironmentVariables,
  RedisEnvironmentVariables,
  RmqEnvironmentVariables,
} from '@ticketing/microservices/shared/env';
import { Exclude } from 'class-transformer';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Mixin } from 'ts-mixer';

export type AppConfigService = ConfigService<EnvironmentVariables, true>;

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, '..', '..', '..', '..', '..', 'package.json');

export class EnvironmentVariables extends Mixin(
  BaseEnvironmentVariables,
  RedisEnvironmentVariables,
  RmqEnvironmentVariables,
) {
  @Exclude()
  private pkg: { [key: string]: unknown; name?: string; version?: string } =
    JSON.parse(readFileSync(pkgPath, 'utf8'));

  APP_NAME?: string = 'expiration';

  APP_VERSION?: string = this.pkg?.version || '0.0.1';
}
