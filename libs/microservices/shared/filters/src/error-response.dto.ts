import { ApiProperty } from '@nestjs/swagger';
import { ErrorResponse } from '@ticketing/shared/errors';

// TODO: add these classes in a future microservices-shared-models

export class ErrorResponseMessageDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  field?: string;
}

export class ErrorResponseDto extends ErrorResponse {
  @ApiProperty({
    description: 'Error status code',
    required: true,
  })
  statusCode: number;

  @ApiProperty({
    description: 'HTTP path or NATS subject',
  })
  path: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty({
    description: 'Error messages',
    required: true,
    type: ErrorResponseMessageDto,
    isArray: true,
  })
  errors: { message: string; field?: string }[];

  @ApiProperty({
    required: false,
  })
  details?: Record<string, unknown>;
}
