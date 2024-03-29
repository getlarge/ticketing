import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GLOBAL_API_PREFIX } from '@ticketing/microservices/shared/constants';
import {
  AppConfigService,
  validate,
} from '@ticketing/microservices/shared/env';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { BullConfigService } from '@ticketing/microservices/shared/redis';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentVariables } from './env';
import { HealthModule } from './health/health.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      expandVariables: true,
      validate: validate(EnvironmentVariables),
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        pinoHttp: {
          transport:
            process.env.NODE_ENV !== 'production'
              ? { target: 'pino-pretty' }
              : undefined,
          level: configService.get('LOG_LEVEL'),
          autoLogging: {
            ignore: (req) => [`/${GLOBAL_API_PREFIX}/health`].includes(req.url),
          },
        },
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useClass: BullConfigService,
    }),
    HealthModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useExisting: GlobalErrorFilter,
    },
    GlobalErrorFilter,
  ],
})
export class AppModule {}
