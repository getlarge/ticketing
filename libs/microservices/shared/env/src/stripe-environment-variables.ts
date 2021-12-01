import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { decorate } from 'ts-mixer';

export class StripeEnvironmentVariables {
  @decorate(Expose())
  @decorate(IsString())
  STRIPE_PUBLISHABLE_KEY: string;

  @decorate(Expose())
  @decorate(IsString())
  STRIPE_SECRET_KEY: string;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  STRIPE_ENDPOINT_SECRET?: string = null;
}
