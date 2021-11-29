import { URL } from 'url';

export function parseRedisUrl(url: string): {
  protocol: string;
  host: string;
  port: number;
  password?: string;
} {
  const redisUrl = new URL(url);
  return {
    protocol: redisUrl.protocol,
    port: +redisUrl.port,
    host: redisUrl.hostname,
    password: redisUrl.password,
  };
}
