import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { CustomStrategy } from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
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

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
      bodyLimit: +process.env.MAX_PAYLOAD_SIZE || 1048576,
    }),
    { bufferLogs: true, abortOnError: false },
  );
  app.setGlobalPrefix(GLOBAL_API_PREFIX);
  app.enableShutdownHooks();

  app.use(globalMiddleware);
  app.useGlobalGuards(new GlobalGuard());
  app.useGlobalInterceptors(new GlobalInterceptor());
  app.useGlobalPipes(new GlobalPipe());
  app.useGlobalFilters(new GlobalFilter());

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
  await microService.listen();
  await app.listen(port, '0.0.0.0', () => {
    Logger.log(`Listening at http://localhost:${port}/${GLOBAL_API_PREFIX}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
