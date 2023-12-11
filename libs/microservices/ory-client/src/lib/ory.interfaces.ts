/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface IOryModuleOptions {
  basePath: string;
  accessToken: string;
}

export interface OryModuleOptionsFactory {
  createOryOptions(): Promise<IOryModuleOptions> | IOryModuleOptions;
}

export interface OryModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OryModuleOptionsFactory>;
  useClass?: Type<OryModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<IOryModuleOptions> | IOryModuleOptions;
  inject?: any[];
}

export class OryModuleOptions implements IOryModuleOptions {
  constructor(
    public readonly basePath: string,
    public readonly accessToken: string
  ) {}
}
