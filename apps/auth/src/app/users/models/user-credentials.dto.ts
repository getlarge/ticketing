import { ApiProperty } from '@nestjs/swagger';
import { userConstraints, UserCredentials } from '@ticketing/shared/models';

export class UserCredentialsDto extends UserCredentials {
  @ApiProperty({
    description: 'User password',
    format: 'password',
    minLength: userConstraints.password.min,
    maxLength: userConstraints.password.max,
  })
  password: string;

  @ApiProperty({
    description: 'User email address',
    format: 'email',
  })
  email: string;
}
