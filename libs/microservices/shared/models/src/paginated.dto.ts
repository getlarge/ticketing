import { ApiProperty } from '@nestjs/swagger';

export class NextPaginationDto {
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

  @ApiProperty({ type: NextPaginationDto, isArray: true })
  next: NextPaginationDto[];

  results: TData[];
}
