import { ApiProperty, OmitType } from '@nestjs/swagger';

import { UserCredentialsDto } from './user-credentials.dto';

export class UserDto extends OmitType(UserCredentialsDto, ['password']) {
  @ApiProperty({
    description: 'User id',
  })
  id: string;

  @ApiProperty({
    description: 'User identity id',
    format: 'uuid',
  })
  identityId: string;
}
