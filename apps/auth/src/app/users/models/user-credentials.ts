import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

export class UserCredentials {
  @Expose()
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @Expose()
  @Transform((value) => value.obj?.password?.trim())
  @IsString({ message: 'Password must be betweem 4 and 20 characters' })
  @Length(4, 20)
  password: string;
}
