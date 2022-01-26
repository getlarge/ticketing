import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { CustomStrategy, Transport } from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Listener } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { GLOBAL_API_PREFIX } from '@ticketing/microservices/shared/constants';
import { Services } from '@ticketing/shared/constants';
import { fastifyHelmet } from 'fastify-helmet';
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
    { bufferLogs: true }
  );

  const configService = app.get<AppConfigService>(ConfigService);
  const port = configService.get('PORT', DEFAULT_PORT, { infer: true });

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.setGlobalPrefix(GLOBAL_API_PREFIX);

  // Fastify
  app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  // NATS
  const natsListener = new Listener(
    configService.get('NATS_CLUSTER_ID'),
    configService.get('NATS_CLIENT_ID'),
    `${Services.EXPIRATION_SERVICE}_GROUP`,
    { url: configService.get('NATS_URL'), name: Services.EXPIRATION_SERVICE },
    {
      durableName: `${Services.EXPIRATION_SERVICE}_subscriptions`,
      manualAckMode: true,
      deliverAllAvailable: true,
      ackWait: 5 * 1000,
    }
  );
  natsListener.transportId = Transport.NATS;
  const options: CustomStrategy = {
    strategy: natsListener,
  };
  const microService = app.connectMicroservice(options);

  // Init
  await microService.listen();
  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Listening at http://localhost:${port}/${GLOBAL_API_PREFIX}`);
  });
}

bootstrap();
