import { Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';
import { decorate } from 'ts-mixer';

import { strToBool } from './helpers';

export class MongoEnvironmentVariables {
  @decorate(Expose())
  @decorate(
    IsUrl({
      protocols: ['mongodb', 'mongodb+srv', 'mongodbs'],
      require_tld: false,
      require_protocol: true,
      require_valid_protocol: true,
    })
  )
  MONGODB_URI: string;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  MONGO_DATABASE?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  MONGO_ROOT_USERNAME?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  MONGO_ROOT_PASSWORD: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  MONGO_USERNAME?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  MONGO_PASSWORD?: string = null;

  @decorate(Expose())
  @decorate(Transform((value) => strToBool(value.obj?.MONGO_FLE_ACTIVE)))
  @decorate(IsOptional())
  @decorate(IsBoolean())
  @decorate(Type(() => Boolean))
  MONGO_FLE_ACTIVE?: boolean;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  MONGO_ENCRYPTION_SECRET?: string = null;
}
