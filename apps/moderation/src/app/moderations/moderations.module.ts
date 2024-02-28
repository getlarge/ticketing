import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { RedisOptions } from 'ioredis';
import { URL } from 'node:url';

import { QueueNames } from '../shared/queues';
import { TicketSchema } from '../tickets/schemas';
import { ModerationsController } from './moderations.controller';
import { ModerationsProcessor } from './moderations.processor';
import { ModerationsService } from './moderations.service';
import { ModerationSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Moderation', schema: ModerationSchema },
      { name: 'Ticket', schema: TicketSchema },
    ]),
    BullModule.registerQueueAsync({
      name: QueueNames.MODERATE_TICKET,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get('REDIS_URL'),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>('REDIS_PORT') || +port,
          host: configService.get<string>('REDIS_HOSTNAME') || hostname,
          db: configService.get<number>('REDIS_DB'),
          password: configService.get<string>('REDIS_PASSWORD') || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        return {
          connection: redisOptions,
          sharedConnection: true,
        };
      },
    }),
  ],
  controllers: [ModerationsController],
  providers: [ModerationsProcessor, ModerationsService],
})
export class ModerationsModule {}
