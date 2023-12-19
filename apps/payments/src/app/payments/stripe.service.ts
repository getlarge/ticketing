import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import type { EnvironmentVariables } from '../env';

@Injectable()
export class StripeService extends Stripe {
  readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject(ConfigService)
    configService: ConfigService<EnvironmentVariables, true>,
  ) {
    super(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2020-08-27',
    });
  }
}
