import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
  TimeoutError,
} from '@nestjs/terminus';
import * as Redis from 'ioredis';

export interface RedisHealthCheckOptions {
  options?: Redis.RedisOptions;
  timeout?: number;
}

export class RedisHealthCheckTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, RedisHealthCheckTimeoutError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// @Injectable({ scope: Scope.TRANSIENT })
@Injectable()
export class RedisHealthCheck extends HealthIndicator {
  constructor() {
    super();
  }

  promiseTimeout(
    delay = 1000,
    client: Redis.Redis,
    fn: Promise<void>
  ): Promise<void> {
    const timeoutError = new RedisHealthCheckTimeoutError(
      'Redis connection timed out'
    );
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        client.quit().finally(() => reject(timeoutError));
      }, delay);

      fn.then(() => {
        clearTimeout(timeout);
        resolve();
      }).catch((e) => {
        clearTimeout(timeout);
        reject(e);
      });
    });
  }

  private async pingMicroservice(client: Redis.Redis): Promise<void> {
    const checkConnection = async (): Promise<void> => {
      if (!client.status.includes('connect')) {
        await client.connect();
      }
      await client.quit();
    };
    return checkConnection();
  }

  async pingCheck(
    key: string,
    options: RedisHealthCheckOptions
  ): Promise<HealthIndicatorResult> {
    let isHealthy = false;
    const timeout = options.timeout || 1000;
    const client = new Redis(options.options);
    try {
      await this.promiseTimeout(timeout, client, this.pingMicroservice(client));
      isHealthy = true;
    } catch (err) {
      this.generateError(key, err, timeout);
    }
    return this.getStatus(key, isHealthy);
  }

  private generateError(key: string, error: Error, timeout: number): void {
    if (!error) {
      return;
    }
    if (error instanceof RedisHealthCheckTimeoutError) {
      throw new TimeoutError(
        timeout,
        this.getStatus(key, false, {
          message: `timeout of ${timeout}ms exceeded`,
        })
      );
    }
    throw new HealthCheckError(
      error.message,
      this.getStatus(key, false, {
        message: error.message,
      })
    );
  }
}
