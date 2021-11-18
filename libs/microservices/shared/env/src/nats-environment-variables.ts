import { Expose, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { decorate } from 'ts-mixer';

export class NatsEnvironmentVariables {
  @decorate(Expose())
  @decorate(
    IsUrl({
      protocols: ['nats', 'http', 'https'],
      require_tld: false,
      require_protocol: true,
      require_valid_protocol: true,
    })
  )
  NATS_URL: string;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  NATS_HOSTNAME?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsNumber())
  @decorate(Type(() => Number))
  NATS_PORT?: number = 0;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  NATS_USERNAME?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  NATS_PASSWORD?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  NATS_CLUSTER_ID?: string = 'ticketing';

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  NATS_CLIENT_ID?: string = null;
}
