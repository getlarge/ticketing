import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LazyModuleLoader, NestFactory } from '@nestjs/core';
import { CustomStrategy } from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ClusterService, ClusterServiceConfig } from '@s1seven/cluster-service';
import { AmqpOptions, AmqpServer } from '@s1seven/nestjs-tools-amqp-transport';
import { GLOBAL_API_PREFIX } from '@ticketing/microservices/shared/constants';
import { Services } from '@ticketing/shared/constants';

import { AppModule } from './app/app.module';
import { EnvironmentVariables } from './app/env';
import { GlobalFilter } from './app/filters/global.filter';
import { GlobalGuard } from './app/guards/global.guard';
import { GlobalInterceptor } from './app/interceptors/global.interceptor';
import { globalMiddleware } from './app/middlewares/global.middleware';
import { GlobalPipe } from './app/pipes/global.pipe';

const DEFAULT_PORT = 3090;
const CLUSTER_MODE = process.env.CLUSTER_MODE === 'true';
const MAX_WORKERS = +process.env.MAX_WORKERS || 2;

// eslint-disable-next-line max-lines-per-function
async function bootstrap(
  opts: { workerId?: number } = {},
  disconnect: () => void = () => process.exit(1),
): Promise<void> {
  /**
   * This is a global variable that will be used to identify the worker id
   * in the application. This is useful for debugging purposes.
   */
  globalThis.__WORKER_ID__ = opts.workerId;

  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({
        trustProxy: true,
        bodyLimit: +process.env.MAX_PAYLOAD_SIZE || 1048576,
      }),
      {
        bufferLogs: true,
        abortOnError: false,
      },
    );

    const configService =
      app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);
    const port = configService.get('PORT', { infer: true }) ?? DEFAULT_PORT;

    const amqpOptions: AmqpOptions = {
      urls: [configService.get('RMQ_URL') as string],
      persistent: true,
      noAck: false,
      prefetchCount: configService.get('RMQ_PREFETCH_COUNT'),
      isGlobalPrefetchCount: false,
      queue: `${Services.MODERATION_SERVICE}_QUEUE`,
      queueOptions: {
        durable: true,
        exclusive: false,
        autoDelete: false,
      },
      socketOptions: {
        keepAlive: true,
        heartbeatIntervalInSeconds: 30,
        reconnectTimeInSeconds: 1,
      },
    };
    const options: CustomStrategy = {
      strategy: new AmqpServer(amqpOptions),
    };
    const microService = app.connectMicroservice(options);

    app.setGlobalPrefix(GLOBAL_API_PREFIX);

    app.enableShutdownHooks();

    app.use(globalMiddleware);
    app.useGlobalGuards(new GlobalGuard());
    app.useGlobalInterceptors(new GlobalInterceptor());
    app.useGlobalPipes(new GlobalPipe());
    app.useGlobalFilters(new GlobalFilter());

    const lazyModuleLoader = app.get(LazyModuleLoader);
    const { RmqManagerModule, RmqManagerService } = await import(
      '@ticketing/microservices/shared/rmq'
    );
    const moduleRef = await lazyModuleLoader.load(() =>
      RmqManagerModule.forRoot({
        apiUrl: configService.get('RMQ_MANAGEMENT_API_URL'),
        username: 'guest',
        password: 'guest',
      }),
    );
    const rmqManager = moduleRef.get(RmqManagerService);

    const pattern = 'MODERATION_SERVICE$';
    const deadLetterExchange = 'MODERATION_SERVICE_DEAD_LETTER_EXCHANGE';
    const definition = {
      'message-ttl': 30000,
      'max-length': 1000,
      'dead-letter-exchange': deadLetterExchange,
    };
    const policyName = 'MODERATION_SERVICE_DLX_POLICY';
    const vhost = '/';
    await rmqManager.setPolicy(
      policyName,
      {
        pattern,
        definition,
      },
      vhost,
    );

    await rmqManager.setExchange(
      deadLetterExchange,
      { autoDelete: false, durable: true },
      'topic',
      vhost,
    );

    await microService.listen();
    await app.listen(DEFAULT_PORT, '0.0.0.0', () => {
      Logger.debug(
        `Listening at http://localhost:${port}/${GLOBAL_API_PREFIX}`,
      );
    });
  } catch (e) {
    Logger.error(e);
    disconnect();
  }
}

if (CLUSTER_MODE) {
  const clusterConfig: ClusterServiceConfig = {
    workers: MAX_WORKERS,
    delay: 2000,
    grace: 1000,
  };

  const clusterService = new ClusterService(clusterConfig);
  clusterService.clusterize(bootstrap).catch((e) => {
    clusterService.logger.error(e);
    process.exit(1);
  });
} else {
  void bootstrap({}, () => {
    process.exit(1);
  });
}
