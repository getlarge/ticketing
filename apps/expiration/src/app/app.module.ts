import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { validate } from '@ticketing/microservices/shared/env';
import { HttpErrorFilter } from '@ticketing/microservices/shared/filters';
import { BullConfigService } from '@ticketing/microservices/shared/redis';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentVariables } from './env';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      expandVariables: true,
      validate: validate(EnvironmentVariables),
    }),
    LoggerModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useClass: BullConfigService,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useExisting: HttpErrorFilter,
    },
    HttpErrorFilter,
  ],
})
export class AppModule {}
