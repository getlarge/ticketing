import { ConfigService } from '@nestjs/config';
import {
  BaseEnvironmentVariables,
  JWTEnvironmentVariables,
  MongoEnvironmentVariables,
  OryActionEnvironmentVariables,
  OryEnvironmentVariables,
} from '@ticketing/microservices/shared/env';
import { Exclude } from 'class-transformer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Mixin } from 'ts-mixer';

export type AppConfigService = ConfigService<EnvironmentVariables, true>;

export class EnvironmentVariables extends Mixin(
  BaseEnvironmentVariables,
  JWTEnvironmentVariables,
  MongoEnvironmentVariables,
  OryEnvironmentVariables,
  OryActionEnvironmentVariables
) {
  @Exclude()
  private pkg: { [key: string]: unknown; name?: string; version?: string } =
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));

  APP_NAME?: string = 'auth';

  APP_VERSION?: string = this.pkg?.version || '0.0.1';
}
