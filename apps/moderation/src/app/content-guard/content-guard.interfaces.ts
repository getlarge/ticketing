import type {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common/interfaces';

export interface IContentGuardModuleOptions {
  openAIApiKey: string;
  dictionary?: { [language: string]: string[] };
}

export interface ContentGuardModuleOptionsFactory {
  createOryOptions():
    | Promise<IContentGuardModuleOptions>
    | IContentGuardModuleOptions;
}

export interface ContentGuardModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ContentGuardModuleOptionsFactory>;
  useClass?: Type<ContentGuardModuleOptionsFactory>;
  useFactory?: (
    ...args: unknown[]
  ) => Promise<IContentGuardModuleOptions> | IContentGuardModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}

export class ContentGuardModuleOptions implements IContentGuardModuleOptions {
  constructor(
    public readonly openAIApiKey: string,
    public dictionary?: { [language: string]: string[] },
  ) {}
}
