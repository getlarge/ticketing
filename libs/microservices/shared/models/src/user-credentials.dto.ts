import { ApiProperty } from '@nestjs/swagger';

export class UserCredentialsDto {
  @ApiProperty({
    description: 'User password',
    required: true,
    format: 'password',
    minLength: 4,
    maxLength: 20,
  })
  password: string;

  @ApiProperty({
    description: 'User email address',
    required: true,
    format: 'email',
  })
  email: string;
}
