import { Expose } from 'class-transformer';
import { IsEmail, IsMongoId, IsUUID } from 'class-validator';

export const userConstraints = {
  password: {
    min: 4,
    max: 20,
  },
};

export class User {
  @Expose()
  @IsMongoId()
  id: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsUUID()
  identityId: string;
}
