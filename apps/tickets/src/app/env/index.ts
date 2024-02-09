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
import { Environment, FEATURE_FLAGS } from '@ticketing/shared/constants';
import { Exclude, Expose } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
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
    JSON.parse(
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      readFileSync(pkgPath, 'utf8'),
    );

  APP_NAME?: string = 'tickets';

  APP_VERSION?: string = this.pkg?.version || '0.0.1';

  @Expose()
  @IsOptional()
  @IsArray()
  @IsEnum(FEATURE_FLAGS, { each: true })
  FEATURE_FLAGS?: FEATURE_FLAGS[] = [FEATURE_FLAGS.TICKET_IMAGE_UPLOAD];

  @Expose()
  @ValidateIf((o) => o.NODE_ENV !== Environment.Development)
  @IsString()
  AWS_S3_BUCKET?: string;

  @Expose()
  @ValidateIf((o) => o.NODE_ENV !== Environment.Development)
  @IsString()
  AWS_S3_REGION?: string;

  @Expose()
  @ValidateIf((o) => o.NODE_ENV !== Environment.Development)
  @IsString()
  AWS_S3_SECRET_ACCESS_KEY?: string;

  @Expose()
  @ValidateIf((o) => o.NODE_ENV !== Environment.Development)
  @IsString()
  AWS_S3_ACCESS_KEY_ID?: string;

  @Expose()
  @ValidateIf((o) => o.NODE_ENV === Environment.Development)
  @IsString()
  STORAGE_PATH?: string;
}
