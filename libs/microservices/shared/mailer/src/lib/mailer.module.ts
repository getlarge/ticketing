import { DynamicModule, Module } from '@nestjs/common';

import { MailerAsyncOptions, MailerOptions } from './mailer.interfaces';
import { MailerService } from './mailer.service';

@Module({})
export class MailerModule {
  static forRoot(options: MailerOptions): DynamicModule {
    return {
      module: MailerModule,
      providers: [
        {
          provide: 'MAILER_OPTIONS',
          useValue: options,
        },
        MailerService,
      ],
      exports: [MailerService],
    };
  }

  static forRootAsync(options: MailerAsyncOptions): DynamicModule {
    return {
      module: MailerModule,
      imports: options.imports,
      providers: [
        {
          provide: 'MAILER_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        MailerService,
      ],
      exports: [MailerService],
    };
  }
}
