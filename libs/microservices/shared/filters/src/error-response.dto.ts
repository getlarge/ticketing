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
  declare statusCode: number;

  @ApiProperty({
    description: 'HTTP path or NATS subject',
  })
  declare path: string;

  @ApiProperty()
  declare timestamp: string;

  @ApiProperty({
    description: 'Error messages',
    required: true,
    type: ErrorResponseMessageDto,
    isArray: true,
  })
  declare errors: { message: string; field?: string }[];

  @ApiProperty({
    required: false,
  })
  declare details?: Record<string, unknown>;
}
