import { ConfigService } from '@nestjs/config';
import { OryKetoEnvironmentVariables } from '@ticketing/microservices/shared/env';
import { Exclude } from 'class-transformer';
import { Mixin } from 'ts-mixer';

export type AppConfigService = ConfigService<EnvironmentVariables, true>;

export class EnvironmentVariables extends Mixin(OryKetoEnvironmentVariables) {
  @Exclude()
  // private pkg: { [key: string]: unknown; name?: string; version?: string } =
  //   JSON.parse(readFileSync(pkgPath, 'utf8'));
  APP_NAME?: string = 'payments';

  APP_VERSION?: string = '0.0.1';
}
