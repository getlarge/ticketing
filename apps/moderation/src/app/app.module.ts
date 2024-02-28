import {
  BeforeApplicationShutdown,
  Logger,
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from '@ticketing/microservices/shared/env';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentVariables } from './env';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validate(EnvironmentVariables),
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
    BeforeApplicationShutdown
{
  readonly logger = new Logger(AppModule.name);

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
