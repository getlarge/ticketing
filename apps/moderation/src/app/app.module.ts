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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { AsyncLocalStorageModule } from '@ticketing/microservices/shared/async-local-storage';
import { validate } from '@ticketing/microservices/shared/env';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentVariables } from './env';
import { ModuleMiddleware } from './middlewares/module.middleware';
import { RequestContextMiddleware } from './middlewares/request-context.middleware';
import { ModerationsController } from './moderation/moderations.controller';
import { ModerationsModule } from './moderation/moderations.module';
import { TicketsModule } from './tickets/tickets.module';

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
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    TicketsModule,
    ModerationsModule,
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
      .forRoutes(AppController, ModerationsController);
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
