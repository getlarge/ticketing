import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from '@ticketing/microservices/shared/env';
import { resolve } from 'node:path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentVariables } from './env';

@Module({
  imports: [
    ConfigModule.forRoot({
      // cache: true,
      isGlobal: true,
      envFilePath: resolve('apps/moderation/.env'),
      validate: validate(EnvironmentVariables),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
