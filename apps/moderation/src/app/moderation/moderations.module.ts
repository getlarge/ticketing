import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OryAuthenticationModule,
  OryPermissionsModule,
} from '@ticketing/microservices/ory-client';
import { redisStore } from 'cache-manager-ioredis-yet';
import type { RedisOptions } from 'ioredis';
import { URL } from 'node:url';

import { ContentGuardModule } from '../content-guard/content-guard.module';
import { AppConfigService, EnvironmentVariables } from '../env';
import { QueueNames } from '../shared/queues';
import { ModerationsController } from './moderations.controller';
import { ModerationsProcessor } from './moderations.processor';
import { ModerationsService } from './moderations.service';
import { Moderation, ModerationSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Moderation.name, schema: ModerationSchema },
    ]),
    ContentGuardModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        openAIApiKey: configService.get('OPENAI_API_KEY'),
      }),
    }),
    BullModule.registerQueueAsync({
      name: QueueNames.MODERATE_TICKET,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get('REDIS_URL'),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>('REDIS_PORT') || +port,
          host: configService.get<string>('REDIS_HOSTNAME') || hostname,
          db: configService.get<number>('REDIS_DB'),
          password: configService.get<string>('REDIS_PASSWORD') || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        return {
          connection: redisOptions,
          sharedConnection: true,
        };
      },
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: AppConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get('REDIS_URL'),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>('REDIS_PORT') || +port,
          host: configService.get<string>('REDIS_HOSTNAME') || hostname,
          db: configService.get<number>('REDIS_DB'),
          password: configService.get<string>('REDIS_PASSWORD') || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        const store = await redisStore(redisOptions);
        return {
          store,
        };
      },
    }),
    OryAuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        kratosAccessToken: configService.get('ORY_KRATOS_API_KEY'),
        kratosPublicApiPath: configService.get('ORY_KRATOS_PUBLIC_URL'),
        kratosAdminApiPath: configService.get('ORY_KRATOS_ADMIN_URL'),
        hydraAccessToken: configService.get('ORY_HYDRA_API_KEY'),
        hydraPublicApiPath: configService.get('ORY_HYDRA_PUBLIC_URL'),
        hydraAdminApiPath: configService.get('ORY_HYDRA_ADMIN_URL'),
      }),
    }),
    OryPermissionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        ketoAccessToken: configService.get('ORY_KETO_API_KEY'),
        ketoPublicApiPath: configService.get('ORY_KETO_PUBLIC_URL'),
        ketoAdminApiPath: configService.get('ORY_KETO_ADMIN_URL'),
      }),
    }),
  ],
  controllers: [ModerationsController],
  providers: [ModerationsProcessor, ModerationsService],
})
export class ModerationsModule {}
