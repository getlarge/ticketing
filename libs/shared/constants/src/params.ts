export enum Environment {
  Development = 'development',
  DockerDevelopment = 'docker_development',
  Production = 'production',
  Staging = 'staging',
  Test = 'test',
}

export enum LogLevel {
  Warn = 'warn',
  Error = 'error',
  Silent = 'silent',
  Debug = 'debug',
  Info = 'info',
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

export const VERSION_HEADER_NAME = 'X-Version';
export const AUTHORIZATION_HEADER_NAME = 'X-Access-Token';

export const MAJOR_SEMVER_REGEX = new RegExp(/0|[1-9]\d*/);
