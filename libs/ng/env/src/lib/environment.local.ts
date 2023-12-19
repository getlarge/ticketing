// eslint-disable-next-line @nx/enforce-module-boundaries
import packageInfo from 'package.json';

import { Environment, VersioningType } from './env.interface';
import { getApiVersion } from './helpers';

const version = packageInfo.version;
const apiVersion = getApiVersion(version);

export const environment: Environment = {
  production: false,
  environment: 'development',
  version,
  apiVersion,
  versioningType: VersioningType.HEADER,
  apiBaseDomain: '127.0.0.1:8080',
  // apiBaseDomain: 'ticketing.dev',
  useUnsafeConnection: true,
  stripePublishableKey: '',
  // when using Ory network with tunnel
  // oryBasePath: 'http://localhost:4000',
  // oryUiBasePath: 'http://localhost:4000/ui',
  // when deploying Ory Kratos locally
  oryBasePath: 'http://127.0.0.1:4433',
  oryUiBasePath: 'http://127.0.0.1:4455',
};
