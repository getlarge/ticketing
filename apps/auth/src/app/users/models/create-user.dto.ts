import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User password',
    required: true,
    format: 'password',
  })
  password: string;

  @ApiProperty({
    description: 'User email address',
    required: true,
    format: 'email',
  })
  email: string;
}
