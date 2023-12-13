import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { decorate } from 'ts-mixer';

type BrokerProtocol = 'amqp' | 'amqps';
type BrokerUrl = `${BrokerProtocol}://${string}`;

export class RmqEnvironmentVariables {
  @decorate(Expose())
  @decorate(
    IsUrl({
      protocols: ['amqp', 'amqps'],
      require_tld: false,
      require_protocol: true,
      require_valid_protocol: true,
    }),
  )
  RMQ_URL: BrokerUrl;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(
    IsUrl({
      protocols: ['http', 'https'],
      require_tld: false,
      require_protocol: true,
      require_valid_protocol: true,
    }),
  )
  RMQ_MANAGEMENT_API_URL?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  RMQ_HOSTNAME?: string = null;

  @decorate(Expose())
  @decorate(Type(() => Number))
  @decorate(IsOptional())
  @decorate(IsInt())
  RMQ_PORT?: number = 0;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  RMQ_USERNAME?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  RMQ_PASSWORD?: string = null;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  RMQ_PATH?: string = '/';

  @decorate(Expose())
  @decorate(Type(() => Number))
  @decorate(IsOptional())
  @decorate(IsInt())
  RMQ_PREFETCH_COUNT?: number = 0;
}
