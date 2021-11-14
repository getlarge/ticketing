import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@ticketing/microservices/shared/fastify-passport';
import { JwtStrategy } from '@ticketing/microservices/shared/guards';
import { CURRENT_USER_KEY } from '@ticketing/shared/constants';

import { AppConfigService } from '../env';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Ticket.name,
        schema: TicketSchema,
      },
    ]),
    PassportModule.register({
      assignProperty: CURRENT_USER_KEY,
      session: true,
    }),
    JwtModule.registerAsync({
      useFactory: (configService: AppConfigService) => ({
        privateKey: configService.get('JWT_PRIVATE_KEY'),
        publicKey: configService.get('JWT_PUBLIC_KEY', { infer: true }),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN'),
          algorithm: configService.get('JWT_ALGORITHM'),
          issuer: `${configService.get('APP_NAME')}.${configService.get(
            'APP_VERSION'
          )}.${configService.get('NODE_ENV')}`,
          audience: '',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, JwtStrategy],
})
export class TicketsModule {}
