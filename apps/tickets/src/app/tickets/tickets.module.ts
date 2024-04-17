import { OryOAuth2Module } from '@getlarge/hydra-client-wrapper';
import {
  OryPermissionsModule,
  OryRelationshipsModule,
} from '@getlarge/keto-client-wrapper';
import { OryFrontendModule } from '@getlarge/kratos-client-wrapper';
import { AmqpClient, AmqpOptions } from '@getlarge/nestjs-tools-amqp-transport';
import {
  FileStorageLocal,
  FileStorageLocalSetup,
  FileStorageModule,
  FileStorageS3,
  FileStorageS3Setup,
  MethodTypes,
} from '@getlarge/nestjs-tools-file-storage';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import {
  ClientsModule,
  CustomClientOptions,
  Transport,
} from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalErrorFilter } from '@ticketing/microservices/shared/filters';
import {
  OryAuthenticationGuard,
  OryOAuth2AuthenticationGuard,
} from '@ticketing/microservices/shared/guards';
import { getReplyQueueName } from '@ticketing/microservices/shared/rmq';
import { Environment, Services } from '@ticketing/shared/constants';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

import { AppConfigService, EnvironmentVariables } from '../env';
import {
  MODERATIONS_CLIENT,
  ORDERS_CLIENT,
  ORY_AUTH_GUARD,
  ORY_OAUTH2_GUARD,
} from '../shared/constants';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketsMSController } from './tickets-ms.controller';

const MongooseFeatures = MongooseModule.forFeatureAsync([
  {
    name: Ticket.name,
    useFactory: () => {
      const schema = TicketSchema;
      schema.plugin(updateIfCurrentPlugin);
      return schema;
    },
    inject: [ConfigService],
  },
]);

const clientFactory = (
  configService: AppConfigService,
  consumerService: Services,
): CustomClientOptions => {
  const options: AmqpOptions = {
    urls: [configService.get('RMQ_URL') as string],
    persistent: true,
    noAck: true,
    prefetchCount: configService.get('RMQ_PREFETCH_COUNT'),
    isGlobalPrefetchCount: false,
    queue: `${consumerService}_QUEUE`,
    replyQueue: getReplyQueueName(consumerService, Services.TICKETS_SERVICE),
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
  return {
    customClass: AmqpClient,
    options,
  };
};

const Clients = ClientsModule.registerAsync([
  {
    name: ORDERS_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: AppConfigService) => {
      const clientOptions = clientFactory(
        configService,
        Services.ORDERS_SERVICE,
      );
      return { ...clientOptions, transport: Transport.RMQ };
    },
  },
  {
    name: MODERATIONS_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: AppConfigService) => {
      const clientOptions = clientFactory(
        configService,
        Services.MODERATION_SERVICE,
      );
      return { ...clientOptions, transport: Transport.RMQ };
    },
  },
]);

const sanitizePath = (fileName: string, root: string): string => {
  if (fileName.indexOf('\0') !== -1) {
    throw new Error('Invalid path');
  }
  const safeInput = path.normalize(fileName).replace(/^(\.\.(\/|\\|$))+/, '');

  const absoluteFilepath = path.join(root, safeInput);
  if (absoluteFilepath.indexOf(root) !== 0) {
    throw new Error('Invalid path');
  }
  return absoluteFilepath;
};

@Module({
  imports: [
    MongooseFeatures,
    Clients,
    FileStorageModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => {
        const environment = configService.get('NODE_ENV', { infer: true });
        if (environment === Environment.Development) {
          const setup: FileStorageLocalSetup = {
            storagePath: configService.get('STORAGE_PATH'),
            maxPayloadSize: configService.get('MAX_PAYLOAD_SIZE'),
          };

          const filePath = async (options: {
            _req?: Request;
            fileName: string;
            methodType: MethodTypes;
          }): Promise<string> => {
            const { fileName, methodType } = options;
            const root = path.resolve(setup.storagePath);
            const absoluteFilepath = sanitizePath(fileName, root);
            if (methodType !== MethodTypes.WRITE) {
              return absoluteFilepath;
            }
            const { dir } = path.parse(absoluteFilepath);
            try {
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              await readdir(dir);
            } catch (error) {
              if (error.code === 'ENOENT') {
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                await mkdir(dir, { recursive: true });
              } else {
                throw error;
              }
            }
            return absoluteFilepath;
          };

          return new FileStorageLocal(setup, () => {
            return {
              filePath,
              limits: { fileSize: setup.maxPayloadSize * 1024 * 1024 },
            };
          });
        }
        const setup: FileStorageS3Setup = {
          maxPayloadSize: configService.get('MAX_PAYLOAD_SIZE'),
          bucket: configService.get('AWS_S3_BUCKET'),
          region: configService.get('AWS_S3_REGION'),
          credentials: {
            accessKeyId: configService.get('AWS_S3_ACCESS_KEY_ID'),
            secretAccessKey: configService.get('AWS_S3_SECRET_ACCESS_KEY'),
          },
        };
        return new FileStorageS3(setup);
      },
    }),
    OryFrontendModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        basePath: configService.get('ORY_KRATOS_PUBLIC_URL'),
      }),
    }),
    OryPermissionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        basePath: configService.get('ORY_KETO_PUBLIC_URL'),
      }),
    }),
    OryRelationshipsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        accessToken: configService.get('ORY_KETO_API_KEY'),
        basePath: configService.get('ORY_KETO_ADMIN_URL'),
      }),
    }),
    OryOAuth2Module.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        basePath: configService.get('ORY_HYDRA_PUBLIC_URL'),
        accessToken: configService.get('ORY_HYDRA_API_KEY'),
      }),
    }),
  ],
  controllers: [TicketsController, TicketsMSController],
  providers: [
    {
      provide: APP_FILTER,
      useExisting: GlobalErrorFilter,
    },
    GlobalErrorFilter,
    TicketsService,
    {
      provide: ORY_AUTH_GUARD,
      useClass: OryAuthenticationGuard(),
    },
    {
      provide: ORY_OAUTH2_GUARD,
      useClass: OryOAuth2AuthenticationGuard(),
    },
  ],
  exports: [MongooseFeatures, Clients, TicketsService],
})
export class TicketsModule {}
