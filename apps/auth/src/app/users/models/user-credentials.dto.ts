import { ApiProperty } from '@nestjs/swagger';

import { userConstraints } from './user-constraints';
import { UserCredentials } from './user-credentials';

export class UserCredentialsDto extends UserCredentials {
  @ApiProperty({
    description: 'User password',
    required: true,
    format: 'password',
    minLength: userConstraints.password.min,
    maxLength: userConstraints.password.max,
  })
  password: string;

  @ApiProperty({
    description: 'User email address',
    required: true,
    format: 'email',
  })
  email: string;
}
