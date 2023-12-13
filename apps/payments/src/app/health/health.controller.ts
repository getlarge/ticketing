import {
  Controller,
  Get,
  Inject,
  Injectable,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { getConnectionToken } from '@nestjs/mongoose';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
  MicroserviceHealthIndicatorOptions,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import {
  HEALTH_DEFAULT_HEAP_USED_TRESHOLD,
  HEALTH_DEFAULT_MEMORY_RSS_TRESHOLD,
  HEALTH_HTTP_PING_TIMEOUT,
  HEALTH_MONGO_PING_TIMEOUT,
  HEALTH_RPC_PING_TIMEOUT,
} from '@ticketing/microservices/shared/constants';
import { Resources } from '@ticketing/shared/constants';
import { Connection } from 'mongoose';

import { AppConfigService } from '../env';

@ApiTags(Resources.HEALTH)
@Controller({ path: Resources.HEALTH, version: VERSION_NEUTRAL })
@Injectable()
export class HealthController {
  readonly heapUsedThreshold: number;
  readonly rssThreshold: number;
  readonly microserviceOptions: MicroserviceHealthIndicatorOptions;

  constructor(
    @Inject(ConfigService) private readonly configService: AppConfigService,
    @Inject(getConnectionToken())
    private readonly mongooseConnection: Connection,
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly mongo: MongooseHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
  ) {
    this.heapUsedThreshold = this.configService.get<number>(
      'HEAP_USED_TRESHOLD',
      HEALTH_DEFAULT_HEAP_USED_TRESHOLD,
    );
    this.rssThreshold = this.configService.get<number>(
      'MEMORY_RSS_TRESHOLD',
      HEALTH_DEFAULT_MEMORY_RSS_TRESHOLD,
    );
    this.microserviceOptions = {
      transport: Transport.RMQ,
      options: {
        urls: [configService.get('RMQ_URL') as string],
      },
      timeout: HEALTH_RPC_PING_TIMEOUT,
    };
  }

  @ApiExcludeEndpoint()
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    const extraHealthChecks = [
      () => this.memory.checkHeap('memoryHeap', this.heapUsedThreshold),
      () => this.memory.checkRSS('memoryRSS', this.rssThreshold),
      () =>
        this.http.pingCheck('http', 'https://google.com', {
          timeout: HEALTH_HTTP_PING_TIMEOUT,
        }),
      () =>
        this.mongo.pingCheck('mongo', {
          connection: this.mongooseConnection,
          timeout: HEALTH_MONGO_PING_TIMEOUT,
        }),
      () => this.microservice.pingCheck('rpc', this.microserviceOptions),
    ];

    return this.health.check(extraHealthChecks);
  }
}
