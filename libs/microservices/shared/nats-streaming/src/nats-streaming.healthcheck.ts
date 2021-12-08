import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
  TimeoutError,
} from '@nestjs/terminus';
import { NatsStreamingPublishOptions } from '@nestjs-plugins/nestjs-nats-streaming-transport';

import { NatsStreamingPublisher } from './nats-streaming.publisher';

export interface NatsStreamingHealthCheckOptions {
  options?: NatsStreamingPublishOptions;
  timeout?: number;
}

export class NatsStreamingHealthCheckTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, NatsStreamingHealthCheckTimeoutError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// @Injectable({ scope: Scope.TRANSIENT })
@Injectable()
export class NatsStreamingHealthCheck extends HealthIndicator {
  constructor() {
    super();
  }

  promiseTimeout(delay = 1000, fn: Promise<void>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () =>
          reject(
            new NatsStreamingHealthCheckTimeoutError(
              'NATS Streaming connection timed out'
            )
          ),
        delay
      );
      fn.then(() => resolve())
        .catch((e) => reject(e))
        .finally(() => clearTimeout(timeout));
    });
  }

  private async pingMicroservice(
    options: NatsStreamingHealthCheckOptions
  ): Promise<void> {
    const client = new NatsStreamingPublisher(options.options);
    const checkConnection = async (): Promise<void> => {
      await client.connect();
      client.close();
    };
    return await checkConnection();
  }

  async pingCheck(
    key: string,
    options: NatsStreamingHealthCheckOptions
  ): Promise<HealthIndicatorResult> {
    let isHealthy = false;
    const timeout = options.timeout || 1000;
    try {
      await this.promiseTimeout(timeout, this.pingMicroservice(options));
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
    if (error instanceof NatsStreamingHealthCheckTimeoutError) {
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
