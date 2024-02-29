import { InjectionToken, ModuleMetadata } from '@nestjs/common';

export type MailerOptions = MailerOptionsWithObject | MailerOptionsWithUrl;

export interface BaseMailerOptions {
  fromName?: string;
  fromAddress: string;
}

export interface MailerOptionsWithObject extends BaseMailerOptions {
  host: string;
  port: number;
  secure?: boolean;
  user?: string;
  password?: string;
}

export interface MailerOptionsWithUrl extends BaseMailerOptions {
  url: string;
}

export interface MailerAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => Promise<MailerOptions> | MailerOptions;
  inject?: InjectionToken[];
}
