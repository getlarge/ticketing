import { Expose } from 'class-transformer';
import { IsMongoId } from 'class-validator';

import { UserCredentials } from './user-credentials';

export class User extends UserCredentials {
  @Expose()
  @IsMongoId()
  id: string;
}
