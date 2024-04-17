import './vault';
import 'reflect-metadata';

import fastifyCors from '@fastify/cors';
import { fastifyHelmet } from '@fastify/helmet';
import { AmqpOptions, AmqpServer } from '@getlarge/nestjs-tools-amqp-transport';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { CustomStrategy } from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import {
  bearerSecurityScheme,
  GLOBAL_API_PREFIX,
  SecurityRequirements,
  sessionSecurityScheme,
} from '@ticketing/microservices/shared/constants';
import { Resources, Services } from '@ticketing/shared/constants';
import { Logger } from 'nestjs-pino';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { AppModule } from './app/app.module';
import { AppConfigService } from './app/env';
import { APP_FOLDER, DEFAULT_PORT } from './app/shared/constants';

// eslint-disable-next-line max-lines-per-function
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
      bodyLimit: 1048576,
    }),
    { bufferLogs: true, abortOnError: false },
  );

  const configService = app.get<AppConfigService>(ConfigService);
  const port = configService.get('PORT', DEFAULT_PORT, { infer: true });
  const environment = configService.get('NODE_ENV', { infer: true });
  const swaggerUiPrefix = configService.get('SWAGGER_PATH', { infer: true });
  const proxyServerUrls = configService.get('PROXY_SERVER_URLS', {
    infer: true,
  });

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
  if (!proxyServerUrls.length && environment === 'development') {
    await app.register(fastifyCors, {
      origin: (origin, cb) => {
        const hostname = new URL(origin).hostname;
        if (hostname === 'localhost') {
          cb(null, true);
          return;
        }
        cb(new Error('Not allowed'), false);
      },
      // allowedHeaders: ALLOWED_HEADERS,
      // exposedHeaders: EXPOSED_HEADERS,
      allowedHeaders: '*',
      exposedHeaders: '*',
    });
  }

  const amqpOptions: AmqpOptions = {
    urls: [configService.get('RMQ_URL') as string],
    persistent: true,
    noAck: false,
    prefetchCount: configService.get('RMQ_PREFETCH_COUNT'),
    isGlobalPrefetchCount: false,
    queue: `${Services.PAYMENTS_SERVICE}_QUEUE`,
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

  // Swagger UI
  const documentBuilder = new DocumentBuilder()
    .setTitle('Payments API')
    .setDescription('Ticketing payments API description')
    .setVersion(configService.get('APP_VERSION'))
    .addSecurity(SecurityRequirements.Session, sessionSecurityScheme)
    .addSecurity(SecurityRequirements.Bearer, bearerSecurityScheme)
    .addSecurityRequirements(SecurityRequirements.Session)
    .addSecurityRequirements(SecurityRequirements.Bearer)
    .addServer(configService.get('SERVER_URL'))
    .addTag(Resources.PAYMENTS);

  if (proxyServerUrls.length) {
    for (const serverUrl of proxyServerUrls) {
      documentBuilder.addServer(serverUrl);
    }
  }

  const document = SwaggerModule.createDocument(app, documentBuilder.build());
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };
  SwaggerModule.setup(swaggerUiPrefix, app, document, customOptions);

  // Save OpenAPI specs
  const openApiPath = resolve(APP_FOLDER, 'openapi.json');
  if (existsSync(APP_FOLDER)) {
    writeFileSync(openApiPath, JSON.stringify(document, null, 2));
  }

  // Init
  await microService.listen();
  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Listening at http://localhost:${port}/${GLOBAL_API_PREFIX}`);
    logger.log(
      `Access SwaggerUI at http://localhost:${port}/${swaggerUiPrefix}`,
    );
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
