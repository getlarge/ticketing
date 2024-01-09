import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Options } from 'amqplib';
import { firstValueFrom } from 'rxjs';

import type {
  ApplyTo,
  ExchangesResponse,
  ExchangeType,
  QueuesResponse,
} from './rmq.interfaces';

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

type KeysToSnakeCase<T> = {
  [K in keyof T as CamelToSnakeCase<string & K>]: T[K];
};

const toSnakeCaseProperties = <T extends object>(obj: T): KeysToSnakeCase<T> =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const snakeCaseKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
    return { ...acc, [snakeCaseKey]: value };
  }, {} as KeysToSnakeCase<T>);

/*
 * @see http://localhost:15672/api/index.html for RabbitMQ management API docs
 */
@Injectable()
export class RmqManagerService {
  readonly logger = new Logger(RmqManagerService.name);

  constructor(@Inject(HttpService) private readonly httpService: HttpService) {
    this.httpService.axiosRef.interceptors.response.use(
      (response) => response,
      (error) => {
        // handling errors as described in https://axios-http.com/docs/handling_errors
        this.logger.error(error.message);
        if (error.response) {
          const err = new Error('Error response received');
          return Promise.reject(err);
        } else if (error.request) {
          const err = new Error(error.message);
          return Promise.reject(err);
        }
        return Promise.reject(new Error(error.message));
      },
    );
  }

  async setPolicy(
    policyName: string,
    options: {
      pattern: string;
      definition: Record<string, string | number>;
      applyTo?: ApplyTo;
      priority?: number;
    },
    vhost: string = '/',
  ): Promise<void> {
    const { pattern, definition, applyTo = 'all', priority = 0 } = options;
    this.logger.debug(
      `Setting policy ${policyName} on ${applyTo} for pattern ${pattern}.`,
    );
    const encodedVhost = encodeURIComponent(vhost);
    await firstValueFrom(
      this.httpService.put(`/policies/${encodedVhost}/${policyName}`, {
        pattern,
        definition,
        applyTo,
        priority,
      }),
    );
  }

  async getQueues(
    options: {
      page?: number;
      pageSize?: number;
      name?: string;
      useRegex?: boolean;
      sortReverse?: boolean;
      pagination?: boolean;
    } = {},
    vhost: string = '/',
  ): Promise<QueuesResponse> {
    const params = {
      page: 1,
      page_size: 100,
      use_regex: false,
      sort_reverse: false,
      pagination: true,
      ...toSnakeCaseProperties(options),
    };
    const { data } = await firstValueFrom(
      this.httpService.get<QueuesResponse>('/queues', {
        params,
        headers: { 'x-vhost': vhost },
      }),
    );
    return data;
  }

  async setQueue(
    queueName: string,
    options: Options.AssertQueue,
    vhost: string = '/',
  ): Promise<void> {
    const encodedVhost = encodeURIComponent(vhost);
    const body = toSnakeCaseProperties(options);
    await firstValueFrom(
      this.httpService.put(`/queues/${encodedVhost}/${queueName}`, body),
    );
  }

  async deleteQueue(queueName: string, vhost: string = '/'): Promise<void> {
    const encodedVhost = encodeURIComponent(vhost);
    await firstValueFrom(
      this.httpService.delete(`/queues/${encodedVhost}/${queueName}`, {
        params: { if_empty: true, if_unused: true },
      }),
    );
  }

  async getExchanges(
    options: {
      page?: number;
      pageSize?: number;
      name?: string;
      useRegex?: boolean;
      sortReverse?: boolean;
      pagination?: boolean;
    } = {},
    vhost: string = '/',
  ): Promise<ExchangesResponse> {
    const params = {
      page: 1,
      page_size: 100,
      use_regex: false,
      sort_reverse: false,
      pagination: true,
      ...toSnakeCaseProperties(options),
    };
    const { data } = await firstValueFrom(
      this.httpService.get<ExchangesResponse>('/exchanges', {
        params,
        headers: { 'x-vhost': vhost },
      }),
    );
    return data;
  }

  async setExchange(
    exchangeName: string,
    options: Options.AssertExchange,
    exchangeType: ExchangeType = 'topic',
    vhost: string = '/',
  ): Promise<void> {
    const encodedVhost = encodeURIComponent(vhost);
    const body = toSnakeCaseProperties({ ...options, type: exchangeType });
    await firstValueFrom(
      this.httpService.put(`/exchanges/${encodedVhost}/${exchangeName}`, body),
    );
  }

  async deleteExchange(
    exchangeName: string,
    vhost: string = '/',
  ): Promise<void> {
    const encodedVhost = encodeURIComponent(vhost);
    await firstValueFrom(
      this.httpService.delete(`/exchanges/${encodedVhost}/${exchangeName}`, {
        params: { if_unused: true },
      }),
    );
  }
}
