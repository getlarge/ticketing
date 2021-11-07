import { ConfigService } from '@nestjs/config';
import {
  BaseEnvironmentVariables,
  JWTEnvironmentVariables,
  MongoEnvironmentVariables,
} from '@ticketing/microservices/shared/env';
import { Exclude } from 'class-transformer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Mixin } from 'ts-mixer';

// import { DEFAULT_SERVER_URL } from '../shared/constants';

export type AppConfigService = ConfigService<EnvironmentVariables>;

export class EnvironmentVariables extends Mixin(
  BaseEnvironmentVariables,
  JWTEnvironmentVariables,
  MongoEnvironmentVariables
) {
  @Exclude()
  private pkg: { [key: string]: unknown; name?: string; version?: string } =
    JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));

  // SERVER_URL = DEFAULT_SERVER_URL;

  APP_NAME?: string = 'auth';

  APP_VERSION?: string = this.pkg?.version || '0.0.1';
}
