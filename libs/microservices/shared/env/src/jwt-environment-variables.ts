import { Expose, Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { decorate } from 'ts-mixer';

@ValidatorConstraint({ name: 'isBase64Buffer', async: false })
export class IsBuffer implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(value: any): boolean {
    if (Buffer.isBuffer(value)) {
      return true;
    }
    return false;
  }

  defaultMessage(): string {
    return 'Input ($value) is not a valid base64 string';
  }
}

export class JWTEnvironmentVariables {
  @decorate(Expose())
  @decorate(
    Transform(({ value }) => (value ? Buffer.from(value, 'base64') : null), {
      toClassOnly: true,
    })
  )
  @decorate(Validate(IsBuffer))
  JWT_PUBLIC_KEY: Buffer;

  @decorate(Expose())
  @decorate(
    Transform(({ value }) => (value ? Buffer.from(value, 'base64') : null), {
      toClassOnly: true,
    })
  )
  @decorate(Validate(IsBuffer))
  JWT_PRIVATE_KEY: Buffer;

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  JWT_ALGORITHM?: string = 'ES256';

  @decorate(Expose())
  @decorate(IsOptional())
  JWT_EXPIRES_IN: string | number = 15;

  @decorate(Expose())
  @decorate(
    Transform(({ value }) => (value ? Buffer.from(value, 'base64') : null), {
      toClassOnly: true,
    })
  )
  @decorate(Validate(IsBuffer))
  SESSION_KEY: Buffer;
}
