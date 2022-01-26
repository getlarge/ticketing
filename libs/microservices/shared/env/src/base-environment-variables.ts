import { ConfigService } from '@nestjs/config';
import { Environment, LogLevel } from '@ticketing/shared/constants';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsSemVer,
  IsString,
  IsUrl,
} from 'class-validator';
import { decorate } from 'ts-mixer';

import { strToBool } from './helpers';

export type AppConfigService<T = BaseEnvironmentVariables> = ConfigService<T>;

export class BaseEnvironmentVariables {
  @decorate(Expose())
  @decorate(IsEnum(Environment))
  NODE_ENV: Environment;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  APP_NAME?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsSemVer())
  APP_VERSION?: string;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsNumber())
  @decorate(Type(() => Number))
  PORT?: number = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  HOSTNAME?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(
    IsUrl({
      require_tld: false,
      require_protocol: true,
      require_valid_protocol: true,
      protocols: ['http', 'https'],
    })
  )
  SERVER_URL?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(
    Transform(
      ({ value }) => (value ? value.split(',').map((v) => v.trim()) : []),
      { toClassOnly: true }
    )
  )
  @decorate(IsArray())
  @decorate(
    IsUrl(
      {
        protocols: ['http', 'https'],
        require_tld: false,
        require_protocol: true,
        require_valid_protocol: true,
      },
      { each: true }
    )
  )
  PROXY_SERVER_URLS?: string[] = [];

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsNumber())
  @decorate(Type(() => Number))
  MAX_PAYLOAD_SIZE?: number = 10;

  // API SPECS EXPLORERS
  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  SWAGGER_PATH?: string = 'open-api';

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  ASYNC_API_PATH?: string = 'async-api';

  // MEMORY / STORAGE
  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsNumber())
  @decorate(Type(() => Number))
  HEAP_USED_TRESHOLD?: number = 1073741824;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsNumber())
  @decorate(Type(() => Number))
  MEMORY_RSS_TRESHOLD?: number = 3221225472;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsNumber())
  @decorate(Type(() => Number))
  DISK_STORAGE_TRESHOLD?: number = 107374182400;

  // DISTRIBUTED SETUP
  @decorate(Expose())
  @decorate(Transform((value) => strToBool(value.obj?.CLUSTER_ENABLED)))
  @decorate(IsOptional())
  @decorate(IsBoolean())
  @decorate(Type(() => Boolean))
  CLUSTER_ENABLED?: boolean = false;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsNumber())
  @decorate(Type(() => Number))
  MAX_WORKERS?: number;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsNumber())
  @decorate(Type(() => Number))
  WEB_CONCURRENCY?: number;

  // LOGS
  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsEnum(LogLevel))
  LOG_LEVEL?: LogLevel = LogLevel.debug;

  // EXTERNAL LINKS
  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(
    IsUrl({
      require_tld: false,
      require_protocol: true,
      require_valid_protocol: true,
      protocols: ['http', 'https'],
    })
  )
  FRONTEND_URL?: string = 'http://localhost:4200';
}
