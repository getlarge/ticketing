import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

import { ClientDto } from './client.dto';

export class CreatedClientDto extends ClientDto {
  @ApiProperty()
  @Expose()
  @IsString()
  clientSecret: string;
}
