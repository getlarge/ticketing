// eslint-disable-next-line @nx/enforce-module-boundaries
import packageInfo from '../../../../../package.json';
import { Environment, VersioningType } from './env.interface';
import { getApiVersion } from './helpers';

const version = packageInfo.version;
const apiVersion = getApiVersion(version);

export const environment: Environment = {
  environment: 'staging',
  production: true,
  version,
  apiVersion,
  versioningType: VersioningType.HEADER,
  apiBaseDomain: 'ticketing.dev',
  stripePublishableKey: '',
  oryBasePath: 'https://auth.ticketing.dev',
};
