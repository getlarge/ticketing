import { ApiProperty } from '@nestjs/swagger';
import { startKeyDto } from 'nestjs-keyset-paginator';

export class NextPaginationDto extends startKeyDto {
  @ApiProperty()
  key: string;

  @ApiProperty({ oneOf: [{ type: 'string' }, { type: 'number' }] })
  value: number | string;
}

export class PaginatedDto<TData> {
  // @ApiProperty()
  // total: number;

  // @ApiProperty()
  // limit: number;

  // @ApiProperty()
  // offset: number;

  @ApiProperty({
    type: NextPaginationDto,
    isArray: true,
    minItems: 1,
    maxItems: 2,
  })
  next: NextPaginationDto[];

  results: TData[];
}
