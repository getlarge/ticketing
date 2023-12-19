/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface IOryAuthenticationModuleOptions {
  kratosAdminApiPath: string;
  kratosPublicApiPath: string;
  kratosAccessToken: string;
  hydraAdminApiPath: string;
  hydraPublicApiPath: string;
  hydraAccessToken: string;
}

export interface OryAuthenticationModuleOptionsFactory {
  createOryOptions():
    | Promise<IOryAuthenticationModuleOptions>
    | IOryAuthenticationModuleOptions;
}

export interface OryAuthenticationModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OryAuthenticationModuleOptionsFactory>;
  useClass?: Type<OryAuthenticationModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) =>
    | Promise<IOryAuthenticationModuleOptions>
    | IOryAuthenticationModuleOptions;
  inject?: any[];
}

export class OryAuthenticationModuleOptions
  implements IOryAuthenticationModuleOptions
{
  constructor(
    public readonly kratosAdminApiPath: string,
    public readonly kratosPublicApiPath: string,
    public readonly kratosAccessToken: string,
    public readonly hydraAdminApiPath: string,
    public readonly hydraPublicApiPath: string,
    public readonly hydraAccessToken: string,
  ) {}
}

export interface IOryPermissionsModuleOptions {
  ketoPublicApiPath: string;
  ketoAdminApiPath: string;
  ketoAccessToken: string;
}

export interface OryPermissionsModuleOptionsFactory {
  createOryOptions():
    | Promise<IOryPermissionsModuleOptions>
    | IOryPermissionsModuleOptions;
}

export interface OryPermissionsModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OryPermissionsModuleOptionsFactory>;
  useClass?: Type<OryPermissionsModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<IOryPermissionsModuleOptions> | IOryPermissionsModuleOptions;
  inject?: any[];
}

export class OryPermissionsModuleOptions
  implements IOryPermissionsModuleOptions
{
  constructor(
    public readonly ketoPublicApiPath: string,
    public readonly ketoAdminApiPath: string,
    public readonly ketoAccessToken: string,
  ) {}
}
