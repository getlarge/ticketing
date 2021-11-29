import { ConfigService } from '@nestjs/config';
import {
  BaseEnvironmentVariables,
  RedisEnvironmentVariables,
} from '@ticketing/microservices/shared/env';
import type { RedisOptions } from 'ioredis';

import { parseRedisUrl } from './helpers';

export class RedisConfig<
  T extends RedisEnvironmentVariables & BaseEnvironmentVariables
> {
  constructor(
    private readonly configService: ConfigService<T, true>,
    private readonly extraOptions: RedisOptions = {}
  ) {}

  get url(): string {
    return this.configService.get<string>('REDIS_URL');
  }

  get options(): RedisOptions {
    const configService = this.configService;
    const { port, host, password, protocol } = parseRedisUrl(
      configService.get<string>('REDIS_URL')
    );
    const baseOptions: RedisOptions = {
      port: configService.get<number>('REDIS_PORT') || port,
      host: configService.get<string>('REDIS_HOSTNAME') || host,
      db: configService.get<number>('REDIS_DB'),
      password: configService.get<string>('REDIS_PASSWORD') || password,
      retryStrategy(times: number): number {
        return Math.min(times * 500, 2000);
      },
      reconnectOnError(): boolean | 1 | 2 {
        return 1;
      },
    };
    if (protocol.startsWith('rediss')) {
      baseOptions.tls = { rejectUnauthorized: false };
    }
    return { ...baseOptions, ...this.extraOptions };
  }
}
