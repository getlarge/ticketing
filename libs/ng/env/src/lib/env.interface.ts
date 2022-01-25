import { Environment as EnvironmentName } from '@ticketing/shared/constants';

export enum VersioningType {
  URI = 'uri',
  HEADER = 'header',
}
export interface Environment {
  environment: `${EnvironmentName}`;
  production: boolean;
  version: string;
  versioningType: VersioningType;
  apiVersion: string;
  apiBaseDomain: string;
  useUnsafeConnection?: boolean;
  stripePublishableKey: string;
}
