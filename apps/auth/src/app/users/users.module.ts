import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@ticketing/microservices/shared/fastify-passport';
import { JwtStrategy } from '@ticketing/microservices/shared/guards';
import { CURRENT_USER_KEY } from '@ticketing/shared/constants';

import { AppConfigService } from '../env';
import { LocalStrategy } from '../guards/local.strategy';
import { Password } from '../shared/password';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          schema.pre('save', async function () {
            if (this.isModified('password')) {
              const hash = await Password.toHash(this.get('password'));
              this.set('password', hash);
            }
          });
          return schema;
        },
        inject: [ConfigService],
      },
    ]),
    PassportModule.register({
      assignProperty: CURRENT_USER_KEY,
      session: true,
    }),
    JwtModule.registerAsync({
      useFactory: (configService: AppConfigService) => ({
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
  ],
  controllers: [UsersController],
  providers: [UsersService, LocalStrategy, JwtStrategy],
})
export class UsersModule {}
