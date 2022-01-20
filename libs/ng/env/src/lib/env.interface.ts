import { Environment as EnvironmentName } from '@ticketing/shared/constants';

export enum VersioningType {
  URI = 'uri',
  HEADER = 'header',
}
export interface Environment {
  production: boolean;
  version: string;
  versioningType: VersioningType;
  apiVersion: string;
  apiBaseDomain: string;
  useUnsafeConnection?: boolean;
  environment: `${EnvironmentName}`;
}
