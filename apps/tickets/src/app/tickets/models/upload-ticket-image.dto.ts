import { ApiProperty } from '@nestjs/swagger';
import { StreamStorageFile } from '@ticketing/microservices/shared/fastify-multipart';

export class UploadTicketImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: StreamStorageFile;
}
