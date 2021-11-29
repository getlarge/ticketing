import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { validate } from '@ticketing/microservices/shared/env';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import { BullConfigService } from '@ticketing/microservices/shared/redis';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentVariables } from './env';
import { OrdersModule } from './orders/orders.module';

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
