import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { decorate } from 'ts-mixer';

export class MyApiEnvironmentVariables {
  @decorate(Expose())
  @decorate(
    IsUrl({
      require_protocol: true,
      require_valid_protocol: true,
      require_host: true,
      require_tld: false,
    }),
  )
  @decorate(IsOptional())
  MY_API_URL?: string = 'http://localhost:3000';

  @decorate(Expose())
  @decorate(IsString())
  @decorate(IsOptional())
  MY_API_KEY?: string = null;
}
