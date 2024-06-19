import type { StreamStorageFile } from '@getlarge/nestjs-tools-fastify-upload';
import { ApiProperty } from '@nestjs/swagger';

export class UploadTicketImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: StreamStorageFile;
}
