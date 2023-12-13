import { ConfigService } from '@nestjs/config';
import {
  BaseEnvironmentVariables,
  JWTEnvironmentVariables,
  MongoEnvironmentVariables,
  OryEnvironmentVariables,
  RmqEnvironmentVariables,
} from '@ticketing/microservices/shared/env';
import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Mixin } from 'ts-mixer';

export type AppConfigService = ConfigService<EnvironmentVariables, true>;

export class EnvironmentVariables extends Mixin(
  BaseEnvironmentVariables,
  JWTEnvironmentVariables,
  MongoEnvironmentVariables,
  RmqEnvironmentVariables,
  OryEnvironmentVariables,
) {
  @Exclude()
  private pkg: { [key: string]: unknown; name?: string; version?: string } =
    JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));

  APP_NAME?: string = 'orders';

  APP_VERSION?: string = this.pkg?.version || '0.0.1';

  @Expose()
  @IsOptional()
  @IsNumber()
  EXPIRATION_WINDOW_SECONDS?: number = 1 * 60;
}
