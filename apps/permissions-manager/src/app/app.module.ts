import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OryPermissionsModule } from '@ticketing/microservices/ory-client';
import { validate } from '@ticketing/microservices/shared/env';

import { CheckPermissionCommand } from './check-permission.command';
import { CreateRelationCommand } from './create-relation.command';
import { DeleteRelationCommand } from './delete-relation.command';
import { EnvironmentVariables } from './env';
import { ExpandPermissionsCommand } from './expand-permissions.command';
import { GetRelationsCommand } from './get-relations.command';

@Module({
  imports: [
    OryPermissionsModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          validate: validate(EnvironmentVariables),
        }),
      ],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        ketoAccessToken: configService.get('ORY_KETO_API_KEY'),
        ketoPublicApiPath: configService.get('ORY_KETO_PUBLIC_URL'),
        ketoAdminApiPath: configService.get('ORY_KETO_ADMIN_URL'),
      }),
    }),
  ],
  providers: [
    CreateRelationCommand,
    DeleteRelationCommand,
    CheckPermissionCommand,
    ExpandPermissionsCommand,
    GetRelationsCommand,
  ],
})
export class AppModule {}
