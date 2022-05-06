// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import packageInfo from '../../../../../package.json';
import { Environment, VersioningType } from './env.interface';
import { getApiVersion } from './helpers';

const version = packageInfo.version;
const apiVersion = getApiVersion(version);

export const environment: Environment = {
  environment: 'production',
  production: true,
  version,
  apiVersion,
  versioningType: VersioningType.HEADER,
  apiBaseDomain: 'ticketing.dev',
  stripePublishableKey:
    'pk_test_51K1a5gClKuHW3hMKM2xeLcKBYBfmOdSTLlh7SzYqwZdnlcYQcF0GjcJ9Ir0lenzYOKEW4cNSLPB7mqWsEH6Wh88T00DI4YsWHv',
};
