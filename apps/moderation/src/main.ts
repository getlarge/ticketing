import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { GLOBAL_API_PREFIX } from '@ticketing/microservices/shared/constants';

import { AppModule } from './app/app.module';
import { EnvironmentVariables } from './app/env';

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

  const configService =
    app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);
  const port = configService.get('PORT', { infer: true }) ?? DEFAULT_PORT;

  await app.listen(port, '0.0.0.0', () => {
    Logger.log(`Listening at http://localhost:${port}/${GLOBAL_API_PREFIX}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
