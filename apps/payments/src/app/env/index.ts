import { ConfigService } from '@nestjs/config';
import {
  BaseEnvironmentVariables,
  JWTEnvironmentVariables,
  MongoEnvironmentVariables,
  NatsEnvironmentVariables,
  StripeEnvironmentVariables,
} from '@ticketing/microservices/shared/env';
import { Services } from '@ticketing/shared/constants';
import { Exclude } from 'class-transformer';
import { pseudoRandomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Mixin } from 'ts-mixer';

export type AppConfigService = ConfigService<EnvironmentVariables, true>;

export class EnvironmentVariables extends Mixin(
  BaseEnvironmentVariables,
  JWTEnvironmentVariables,
  NatsEnvironmentVariables,
  MongoEnvironmentVariables,
  StripeEnvironmentVariables
) {
  @Exclude()
  private pkg: { [key: string]: unknown; name?: string; version?: string } =
    JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));

  APP_NAME?: string = 'payments';

  APP_VERSION?: string = this.pkg?.version || '0.0.1';

  NATS_CLIENT_ID?: string = `${Services.PAYMENTS_SERVICE}_${pseudoRandomBytes(
    4
  ).toString('hex')}`;
}
