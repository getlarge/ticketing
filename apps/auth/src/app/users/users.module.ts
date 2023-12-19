import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { OryAuthenticationModule } from '@ticketing/microservices/ory-client';
import { PassportModule } from '@ticketing/microservices/shared/fastify-passport';
import { JwtStrategy } from '@ticketing/microservices/shared/guards';
import { CURRENT_USER_KEY } from '@ticketing/shared/constants';

import { EnvironmentVariables } from '../env';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          return UserSchema;
        },
        inject: [ConfigService],
      },
    ]),
    PassportModule.register({
      assignProperty: CURRENT_USER_KEY,
      session: true,
    }),
    JwtModule.registerAsync({
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        privateKey: configService.get('JWT_PRIVATE_KEY'),
        publicKey: configService.get('JWT_PUBLIC_KEY'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN'),
          algorithm: configService.get('JWT_ALGORITHM'),
          issuer: configService.get('JWT_ISSUER'),
          audience: '',
        },
      }),
      inject: [ConfigService],
    }),
    OryAuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        kratosAccessToken: configService.get('ORY_KRATOS_API_KEY'),
        kratosPublicApiPath: configService.get('ORY_KRATOS_PUBLIC_URL'),
        kratosAdminApiPath: configService.get('ORY_KRATOS_ADMIN_URL'),
        hydraAccessToken: configService.get('ORY_HYDRA_API_KEY'),
        hydraAdminApiPath: configService.get('ORY_HYDRA_ADMIN_URL'),
        hydraPublicApiPath: configService.get('ORY_HYDRA_PUBLIC_URL'),
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
})
export class UsersModule {}
