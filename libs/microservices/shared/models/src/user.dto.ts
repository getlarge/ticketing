import { ApiProperty, OmitType } from '@nestjs/swagger';

import { UserCredentialsDto } from './user-credentials.dto';

export class UserDto extends OmitType(UserCredentialsDto, ['password']) {
  @ApiProperty({
    description: 'User id',
    required: true,
    // format: 'email',
  })
  id: string;
}
