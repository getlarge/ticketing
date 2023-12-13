import './vault';

import { fastifyHelmet } from '@fastify/helmet';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { CustomStrategy } from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AmqpOptions, AmqpServer } from '@s1seven/nestjs-tools-amqp-transport';
import { GLOBAL_API_PREFIX } from '@ticketing/microservices/shared/constants';
import { Services } from '@ticketing/shared/constants';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app/app.module';
import { AppConfigService } from './app/env';
import { DEFAULT_PORT } from './app/shared/constants';

// eslint-disable-next-line max-lines-per-function
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
      bodyLimit: 1048576,
      // bodyLimit: +process.env.MAX_PAYLOAD_SIZE || 5,
      // maxParamLength: 100,
    }),
    { bufferLogs: true, abortOnError: false },
  );

  const configService = app.get<AppConfigService>(ConfigService);
  const port = configService.get('PORT', DEFAULT_PORT, { infer: true });
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.setGlobalPrefix(GLOBAL_API_PREFIX);

  // Fastify
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  // RMQ
  const amqpOptions: AmqpOptions = {
    urls: [configService.get('RMQ_URL') as string],
    persistent: true,
    noAck: false,
    prefetchCount: configService.get('RMQ_PREFETCH_COUNT'),
    isGlobalPrefetchCount: false,
    queue: `${Services.EXPIRATION_SERVICE}_QUEUE`,
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

  // Init
  await microService.listen();
  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Listening at http://localhost:${port}/${GLOBAL_API_PREFIX}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
