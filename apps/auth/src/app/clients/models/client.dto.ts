import { ApiProperty, PickType } from '@nestjs/swagger';
import { Client } from '@ticketing/shared/models';

export class ClientDto extends PickType(Client, ['id', 'clientId', 'userId']) {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'Ory client id',
    format: 'uuid',
  })
  clientId: string;

  @ApiProperty({
    description: 'Owner id',
  })
  userId: string;
}
