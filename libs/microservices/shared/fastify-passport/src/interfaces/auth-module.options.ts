import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface IAuthModuleOptions {
  defaultStrategy?: string | string[];
  session?: boolean;
  assignProperty?: string;
  // scope?: string | string[];
  // failureFlash?: boolean | string | FlashObject;
  // failureMessage?: boolean | string;
  // successRedirect?: string;
  // failureRedirect?: string;
  // failWithError?: boolean;
  // successFlash?: boolean | string | FlashObject;
  // successMessage?: boolean | string;
  // successReturnToOrRedirect?: string;
  // authInfo?: boolean;
  [key: string]: any;
}

export interface AuthOptionsFactory {
  createAuthOptions(): Promise<IAuthModuleOptions> | IAuthModuleOptions;
}

export interface AuthModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<AuthOptionsFactory>;
  useClass?: Type<AuthOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<IAuthModuleOptions> | IAuthModuleOptions;
  inject?: any[];
}

export class AuthModuleOptions implements IAuthModuleOptions {
  defaultStrategy?: string | string[];
  session?: boolean;
  assignProperty?: string;
}
