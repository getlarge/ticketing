import {
  BullModuleOptions,
  BullOptionsFactory,
  BullQueueProcessor,
  SharedBullConfigurationFactory,
} from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BaseEnvironmentVariables,
  RedisEnvironmentVariables,
} from '@ticketing/microservices/shared/env';

import { RedisConfig } from './redis.config';

@Injectable()
export class BullConfigService<
  T extends RedisEnvironmentVariables & BaseEnvironmentVariables
> implements BullOptionsFactory, SharedBullConfigurationFactory
{
  private readonly redisConfig: RedisConfig<T>;

  constructor(private readonly configService: ConfigService<T, true>) {
    this.redisConfig = new RedisConfig(this.configService, {
      lazyConnect: false,
    });
  }

  createBullOptions(processors?: BullQueueProcessor[]): BullModuleOptions {
    return {
      redis: this.redisConfig.options,
      processors,
    };
  }

  createSharedConfiguration(): BullModuleOptions {
    return {
      redis: this.redisConfig.options,
    };
  }
}
