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
  getCookieOptions,
  GLOBAL_API_PREFIX,
  SecurityRequirements,
  sessionSecurityScheme,
} from '@ticketing/microservices/shared/constants';
import { Resources } from '@ticketing/shared/constants';
import { fastifyHelmet } from 'fastify-helmet';
import fastifyPassport from 'fastify-passport';
import fastifySecureSession from 'fastify-secure-session';
import { existsSync, writeFileSync } from 'fs';
import { Logger } from 'nestjs-pino';
import { resolve } from 'path';

import { AppModule } from './app/app.module';
import { AppConfigService } from './app/env';
import { APP_FOLDER } from './app/shared/constants';

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
  const port = configService.get('PORT', 3333, { infer: true });
  const environment = configService.get('NODE_ENV', { infer: true });
  const swaggerUiPrefix = configService.get('SWAGGER_PATH', { infer: true });

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.setGlobalPrefix(GLOBAL_API_PREFIX);
  // app.useStaticAssets({
  //   root: resolve(`dist/${APP_FOLDER}/public`),
  //   prefix: '/',
  // });

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
  app.register(fastifySecureSession, {
    key: configService.get('SESSION_KEY'),
    cookie: getCookieOptions(environment),
  });
  app.register(fastifyPassport.initialize());
  app.register(fastifyPassport.secureSession());

  // SwaggerUI
  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Ticketing auth API description')
    .setVersion(configService.get('APP_VERSION'))
    .addSecurity(SecurityRequirements.Session, sessionSecurityScheme)
    .addSecurity(SecurityRequirements.Bearer, bearerSecurityScheme)
    .addSecurityRequirements(SecurityRequirements.Session)
    .addSecurityRequirements(SecurityRequirements.Bearer)
    .addTag(Resources.USERS)
    .addServer(configService.get('SERVER_URL'))
    .build();

  const document = SwaggerModule.createDocument(app, config);
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
  if (existsSync(APP_FOLDER)) {
    writeFileSync(openApiPath, JSON.stringify(document, null, 2));
  }

  // Init
  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Listening at http://localhost:${port}/${GLOBAL_API_PREFIX}`);
    logger.log(
      `Access SwaggerUI at http://localhost:${port}/${swaggerUiPrefix}`
    );
  });
}

bootstrap();
