// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import packageInfo from 'package.json';

import { Environment, VersioningType } from './env.interface';
import { getApiVersion } from './helpers';

const version = packageInfo?.version;
const apiVersion = getApiVersion(version);

export const environment: Environment = {
  environment: 'development',
  production: false,
  version,
  apiVersion,
  versioningType: VersioningType.HEADER,
  apiBaseDomain: 'localhost:80',
  // apiBaseDomain: 'ticketing.dev',
  useUnsafeConnection: true,
  // apiBaseDomain: 'local-ticketing.loca.lt', // when using default local tunneling
  // useUnsafeConnection: false,
  stripePublishableKey:
    'pk_test_51K1a5gClKuHW3hMKM2xeLcKBYBfmOdSTLlh7SzYqwZdnlcYQcF0GjcJ9Ir0lenzYOKEW4cNSLPB7mqWsEH6Wh88T00DI4YsWHv',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
