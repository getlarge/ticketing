import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { NatsStreamingHealthCheck } from '@ticketing/microservices/shared/nats-streaming';
import { RedisHealthCheck } from '@ticketing/microservices/shared/redis';

import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  providers: [NatsStreamingHealthCheck, RedisHealthCheck],
  controllers: [HealthController],
  exports: [],
})
export class HealthModule {}
