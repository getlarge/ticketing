import packageInfo from 'package.json';

import { Environment, VersioningType } from './env.interface';
import { getApiVersion } from './helpers';

const version = packageInfo.version;
const apiVersion = getApiVersion(version);

export const environment: Environment = {
  production: false,
  version,
  apiVersion,
  versioningType: VersioningType.HEADER,
  apiBaseDomain: 'ticketing.dev',
  environment: 'development',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
