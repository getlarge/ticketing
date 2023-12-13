import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { RedisHealthCheck } from '@ticketing/microservices/shared/redis';

import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  providers: [RedisHealthCheck],
  controllers: [HealthController],
  exports: [],
})
export class HealthModule {}
