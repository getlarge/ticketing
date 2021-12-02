import {
  Controller,
  Get,
  Inject,
  Injectable,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import {
  HEALTH_DEFAULT_DISK_STORAGE_TRESHOLD,
  HEALTH_DEFAULT_HEAP_USED_TRESHOLD,
  HEALTH_DEFAULT_MEMORY_RSS_TRESHOLD,
  HEALTH_HTTP_PING_TIMEOUT,
  HEALTH_MONGO_PING_TIMEOUT,
  HEALTH_RPC_PING_TIMEOUT,
} from '@ticketing/microservices/shared/constants';
import {
  NatsStreamingConfig,
  NatsStreamingHealthCheck,
} from '@ticketing/microservices/shared/nats-streaming';
import { Resources } from '@ticketing/shared/constants';
import { Connection } from 'mongoose';

import { AppConfigService } from '../env';

@ApiTags(Resources.HEALTH)
@Controller({ path: Resources.HEALTH, version: VERSION_NEUTRAL })
@Injectable()
export class HealthController {
  heapUsedThreshold: number;
  rssThreshold: number;
  diskStorageThreshold: number;

  constructor(
    @Inject(ConfigService) private readonly configService: AppConfigService,
    @Inject(getConnectionToken())
    private readonly mongooseConnection: Connection,
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly mongo: MongooseHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly nats: NatsStreamingHealthCheck
  ) {
    this.heapUsedThreshold = this.configService.get<number>(
      'HEAP_USED_TRESHOLD',
      HEALTH_DEFAULT_HEAP_USED_TRESHOLD
    );
    this.rssThreshold = this.configService.get<number>(
      'MEMORY_RSS_TRESHOLD',
      HEALTH_DEFAULT_MEMORY_RSS_TRESHOLD
    );
    this.diskStorageThreshold = this.configService.get<number>(
      'DISK_STORAGE_TRESHOLD',
      HEALTH_DEFAULT_DISK_STORAGE_TRESHOLD
    );
  }

  @ApiExcludeEndpoint()
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    const extraHealthChecks = [
      () => this.memory.checkHeap('memoryHeap', this.heapUsedThreshold),
      () => this.memory.checkRSS('memoryRSS', this.rssThreshold),
      // () =>
      //   this.disk.checkStorage('storage', {
      //     threshold: this.diskStorageThreshold,
      //     path: '/',
      //   }),
      () =>
        this.http.pingCheck('http', 'https://google.com', {
          timeout: HEALTH_HTTP_PING_TIMEOUT,
        }),
      () =>
        this.mongo.pingCheck('mongo', {
          connection: this.mongooseConnection,
          timeout: HEALTH_MONGO_PING_TIMEOUT,
        }),
      () =>
        this.nats.pingCheck('nats', {
          options: new NatsStreamingConfig(this.configService).options,
          timeout: HEALTH_RPC_PING_TIMEOUT,
        }),
    ];

    return this.health.check(extraHealthChecks);
  }
}
