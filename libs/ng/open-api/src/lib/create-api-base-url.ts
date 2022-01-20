import { Environment, VersioningType } from '@ticketing/ng/env';

export function createApiBaseUrl(env: Environment): string {
  const { apiBaseDomain, apiVersion, useUnsafeConnection, versioningType } =
    env;
  const protocol = useUnsafeConnection ? 'http' : 'https';
  const baseUrl = `${protocol}://${apiBaseDomain}`;
  return versioningType === VersioningType.URI
    ? `${baseUrl}/${apiVersion}`
    : baseUrl;
}
