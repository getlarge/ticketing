import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { NatsStreamingHealthCheck } from '@ticketing/microservices/shared/nats-streaming';

import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  providers: [NatsStreamingHealthCheck],
  controllers: [HealthController],
  exports: [],
})
export class HealthModule {}
