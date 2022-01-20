import { MAJOR_SEMVER_REGEX } from '@ticketing/shared/constants';

import { VersioningType } from '../lib/env.interface';

export const getApiVersion = (
  semver: string,
  versioningType: VersioningType = VersioningType.HEADER
): string => {
  const matches = MAJOR_SEMVER_REGEX.exec(semver);
  const baseVersion = matches?.length ? `${matches[0]}` : '0';
  return versioningType === VersioningType.URI
    ? `v${baseVersion}`
    : baseVersion;
};
