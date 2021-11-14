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
import { Environment, Resources } from '@ticketing/shared/constants';
import { fastifyHelmet } from 'fastify-helmet';
import fastifyPassport from 'fastify-passport';
import fastifySecureSession from 'fastify-secure-session';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app/app.module';
import { AppConfigService } from './app/env';

const globalPrefix = 'api';
const devEnvironments = [
  Environment.Test,
  Environment.Development,
  Environment.DockerDevelopment,
];

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
  app.setGlobalPrefix(globalPrefix);
  // app.useStaticAssets({
  //   root: resolve(`dist/${APP_FOLDER}/public`),
  //   prefix: '/',
  // });

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
    cookie: {
      secure: !devEnvironments.includes(environment),
      signed: false,
    },
  });
  app.register(fastifyPassport.initialize());
  app.register(fastifyPassport.secureSession());

  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Ticketing auth API description')
    .setVersion('1.0')
    .addTag(Resources.USERS)
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

  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Listening at http://localhost:${port}/${globalPrefix}`);
    logger.log(
      `Access SwaggerUI at http://localhost:${port}/${swaggerUiPrefix}`
    );
  });
}

bootstrap();
