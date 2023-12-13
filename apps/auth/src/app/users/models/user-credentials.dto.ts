import { ApiProperty } from '@nestjs/swagger';
import { userConstraints, UserCredentials } from '@ticketing/shared/models';

export class UserCredentialsDto extends UserCredentials {
  @ApiProperty({
    description: 'User password',
    format: 'password',
    minLength: userConstraints.password.min,
    maxLength: userConstraints.password.max,
  })
  declare password: string;

  @ApiProperty({
    description: 'User email address',
    format: 'email',
  })
  declare email: string;
}
