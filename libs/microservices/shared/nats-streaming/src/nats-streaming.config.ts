import { ConfigService } from '@nestjs/config';
import { NatsStreamingPublishOptions } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import {
  BaseEnvironmentVariables,
  NatsEnvironmentVariables,
} from '@ticketing/microservices/shared/env';

export class NatsStreamingConfig<
  T extends NatsEnvironmentVariables & BaseEnvironmentVariables
> {
  constructor(
    private readonly configService: ConfigService<T, true>,
    private readonly extraOptions: Partial<NatsStreamingPublishOptions> = {}
  ) {}

  get url(): string {
    return this.configService.get<string>('NATS_URL');
  }

  get options(): NatsStreamingPublishOptions {
    const configService = this.configService;
    const baseOptions: NatsStreamingPublishOptions = {
      clientId: configService.get('NATS_CLIENT_ID'),
      clusterId: configService.get('NATS_CLUSTER_ID'),
      connectOptions: {
        url: configService.get('NATS_URL'),
        ...(this.extraOptions?.connectOptions || {}),
      },
    };
    return { ...baseOptions, ...this.extraOptions };
  }
}
