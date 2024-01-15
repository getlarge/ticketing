import {
  OryPermissionsModule,
  OryRelationshipsModule,
} from '@getlarge/keto-client-wrapper';
import { OryFrontendModule } from '@getlarge/kratos-client-wrapper';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { LockModule } from '@s1seven/nestjs-tools-lock';
import { redisStore } from 'cache-manager-ioredis-yet';
import type { RedisOptions } from 'ioredis';
import { URL } from 'node:url';

import { ContentGuardModule } from '../content-guard/content-guard.module';
import { AppConfigService, EnvironmentVariables } from '../env';
import { QueueNames } from '../shared/queues';
import { ModerationsController } from './moderations.controller';
import { ModerationsProcessor } from './moderations.processor';
import { ModerationsService } from './moderations.service';
import { ModerationsTasks } from './moderations.tasks';
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
    LockModule.forRootAsync({
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
          redis: redisOptions,
          lock: {
            retryCount: 5,
            retryDelay: 200,
          },
        };
      },
    }),
    ScheduleModule.forRoot(),
    OryFrontendModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        basePath: configService.get('ORY_KRATOS_PUBLIC_URL'),
      }),
    }),
    OryPermissionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        basePath: configService.get('ORY_KETO_PUBLIC_URL'),
      }),
    }),
    OryRelationshipsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        accessToken: configService.get('ORY_KETO_API_KEY'),
        basePath: configService.get('ORY_KETO_ADMIN_URL'),
      }),
    }),
  ],
  controllers: [ModerationsController],
  providers: [ModerationsProcessor, ModerationsService, ModerationsTasks],
})
export class ModerationsModule {}
