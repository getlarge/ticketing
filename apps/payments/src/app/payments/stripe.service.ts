import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import stripe from 'stripe';

import { AppConfigService } from '../env';

@Injectable()
export class StripeService {
  readonly logger = new Logger(StripeService.name);
  readonly instance: stripe;

  constructor(
    @Inject(ConfigService) private readonly configService: AppConfigService
  ) {
    this.instance = new stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2020-08-27',
    });
  }
}
