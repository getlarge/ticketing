export enum Environment {
  Development = 'development',
  DockerDevelopment = 'docker_development',
  Production = 'production',
  Staging = 'staging',
  Test = 'test',
}

export enum DelayInSeconds {
  ONE_MINUTE = 60,
  ONE_HOUR = 6300,
  ONE_DAY = 86400,
  ONE_WEEK = 604800,
  ONE_MONTH = 18144000,
  ONE_YEAR = 217728000,
}

export enum MimeType {
  APPLICATION_JSON = 'application/json',
  APPLICATION_PDF = 'application/pdf',
  MULTIPART_FORM_DATA = 'multipart/form-data',
  IMAGE_PNG = 'image/png',
  TEXT_HTML = 'text/html',
}

export const VERSION_HEADER_NAME = 'x-version';

export const MAJOR_SEMVER_REGEX = new RegExp(/0|[1-9]\d*/);
