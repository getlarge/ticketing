// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
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
  apiBaseDomain: 'app.s1seven.dev',
  stripePublishableKey: '',
};
