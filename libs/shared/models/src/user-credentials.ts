import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

import { userConstraints } from './constraints';

export class UserCredentials {
  @Expose()
  @IsEmail({}, { message: 'email must be valid' })
  email: string;

  @Expose()
  @Transform((value) => value.obj?.password?.trim())
  @IsString({
    message: `password must be betweem ${userConstraints.password.min} and ${userConstraints.password.max} characters`,
  })
  @Length(userConstraints.password.min, userConstraints.password.max)
  password: string;
}
