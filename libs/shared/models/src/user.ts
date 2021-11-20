import { Expose } from 'class-transformer';
import { IsEmail, IsMongoId } from 'class-validator';

export class User {
  @Expose()
  @IsMongoId()
  id: string;

  @Expose()
  @IsEmail()
  email: string;
}
