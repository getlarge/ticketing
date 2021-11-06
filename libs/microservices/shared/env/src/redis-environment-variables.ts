import { Expose, Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { decorate } from 'ts-mixer';

export class RedisEnvironmentVariables {
  @decorate(Expose())
  @decorate(
    IsUrl({
      protocols: ['redis', 'rediss'],
      require_tld: false,
      require_protocol: true,
      require_valid_protocol: true,
    })
  )
  REDIS_URL: string;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  REDIS_HOSTNAME?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsNumber())
  @decorate(Type(() => Number))
  REDIS_PORT?: number = 0;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  REDIS_PASSWORD?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsInt())
  @decorate(Min(0))
  @decorate(Max(16))
  @decorate(Type(() => Number))
  REDIS_DB?: number = 0;
}
