import {
  BeforeApplicationShutdown,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AsyncLocalStorageModule } from '@ticketing/microservices/shared/async-local-storage';
import { validate } from '@ticketing/microservices/shared/env';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentVariables } from './env';
import { ModuleMiddleware } from './middlewares/module.middleware';
import { RequestContextMiddleware } from './middlewares/request-context.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validate(EnvironmentVariables),
    }),
    AsyncLocalStorageModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '/',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule
  implements
    OnModuleDestroy,
    OnModuleInit,
    OnApplicationBootstrap,
    OnApplicationShutdown,
    BeforeApplicationShutdown,
    NestModule
{
  readonly logger = new Logger(AppModule.name);

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(ModuleMiddleware)
      .forRoutes(AppController)
      .apply(RequestContextMiddleware)
      .forRoutes(AppController);
  }

  onModuleInit(): void {
    this.logger.log(`initialized`);
  }

  onApplicationBootstrap(): void {
    this.logger.log(`bootstraped`);
  }

  onModuleDestroy(): void {
    this.logger.log(`destroyed`);
  }

  beforeApplicationShutdown(signal?: string): void {
    this.logger.log(`before shutdown ${signal}`);
  }

  onApplicationShutdown(signal?: string): void {
    this.logger.log(`shutdown ${signal}`);
  }
}
