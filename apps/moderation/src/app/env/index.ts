import { ConfigService } from '@nestjs/config';
import { BaseEnvironmentVariables } from '@ticketing/microservices/shared/env';
import { Exclude } from 'class-transformer';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Mixin } from 'ts-mixer';

export type AppConfigService = ConfigService<EnvironmentVariables, true>;

export class EnvironmentVariables extends Mixin(BaseEnvironmentVariables) {
  @Exclude()
  private pkg: { [key: string]: unknown; name?: string; version?: string } =
    JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));

  APP_NAME?: string = 'moderation';

  APP_VERSION?: string = this.pkg?.version || '0.0.1';
}
