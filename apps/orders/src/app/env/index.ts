import { ConfigService } from '@nestjs/config';
import {
  BaseEnvironmentVariables,
  JWTEnvironmentVariables,
  MongoEnvironmentVariables,
  OryHydraEnvironmentVariables,
  OryKetoEnvironmentVariables,
  OryKratosEnvironmentVariables,
  RmqEnvironmentVariables,
} from '@ticketing/microservices/shared/env';
import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Mixin } from 'ts-mixer';

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
  JWTEnvironmentVariables,
  MongoEnvironmentVariables,
  RmqEnvironmentVariables,
  OryEnvironmentVariables,
) {
  @Exclude()
  private pkg: { [key: string]: unknown; name?: string; version?: string } =
    JSON.parse(readFileSync(pkgPath, 'utf8'));

  APP_NAME?: string = 'orders';

  APP_VERSION?: string = this.pkg?.version || '0.0.1';

  @Expose()
  @IsOptional()
  @IsNumber()
  EXPIRATION_WINDOW_SECONDS?: number = 1 * 60;
}
