import './vault';

import fastifyCors from '@fastify/cors';
import { fastifyHelmet } from '@fastify/helmet';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
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
import { Resources } from '@ticketing/shared/constants';
import { existsSync, writeFileSync } from 'fs';
import { Logger } from 'nestjs-pino';
import { resolve } from 'path';

import { AppModule } from './app/app.module';
import { EnvironmentVariables } from './app/env';
import { APP_FOLDER, DEFAULT_PORT } from './app/shared/constants';

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

  const configService =
    app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);
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
  if (!proxyServerUrls.length && environment === 'production') {
    await app.register(fastifyCors, {
      origin: (origin, cb) => {
        const hostname = new URL(origin).hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          cb(null, true);
          return;
        }
        cb(new Error('Not allowed'), false);
      },
      credentials: true,
      // allowedHeaders: ALLOWED_HEADERS,
      // exposedHeaders: EXPOSED_HEADERS,
      allowedHeaders: '*',
      exposedHeaders: '*',
    });
  }

  // SwaggerUI
  const documentBuilder = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Ticketing auth API description')
    .setVersion(configService.get('APP_VERSION'))
    .addSecurity(SecurityRequirements.Session, sessionSecurityScheme)
    .addSecurity(SecurityRequirements.Bearer, bearerSecurityScheme)
    .addSecurityRequirements(SecurityRequirements.Session)
    .addSecurityRequirements(SecurityRequirements.Bearer)
    .addTag(Resources.USERS)
    .addTag(Resources.CLIENTS)
    .addServer(configService.get('SERVER_URL'));

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
    // customSiteTitle,
    // customfavIcon
  };
  SwaggerModule.setup(swaggerUiPrefix, app, document, customOptions);

  // Save OpenAPI specs
  const openApiPath = resolve(APP_FOLDER, 'openapi.json');
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (existsSync(APP_FOLDER)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    writeFileSync(openApiPath, JSON.stringify(document, null, 2));
  }

  // Init
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
