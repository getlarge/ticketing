import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  ENUM_FILTER_OPERATOR_TYPE,
  filterDto,
  PaginationDto,
  projectionDto,
  REGEX_SEARCH_MODE_TYPE,
  startKeyDto,
  TYPE_STRING_NUM_ARRAY,
} from 'nestjs-keyset-paginator';

export class StartKeyDto extends startKeyDto {
  @ApiProperty()
  key: string;

  @ApiProperty({ oneOf: [{ type: 'string' }, { type: 'number' }] })
  value: number | string;
}

export class SortDto {
  @ApiProperty({ minLength: 2, maxLength: 20 })
  field: string;

  @ApiProperty({ type: Number })
  order: number;
}

export class FilterDto extends PartialType(filterDto) {
  @ApiProperty({
    oneOf: [
      {
        type: 'array',
        items: {
          type: 'string',
          minLength: 2,
          maxLength: 20,
        },
      },
      { type: 'string', minLength: 2, maxLength: 20 },
    ],
  })
  name: string | string[];

  @ApiProperty({ minLength: 1, maxLength: 20 })
  value: string;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'number' }],
    required: false,
  })
  arr_value: TYPE_STRING_NUM_ARRAY;

  @ApiProperty({
    enum: ENUM_FILTER_OPERATOR_TYPE,
    enumName: 'FilterOperatorType',
    default: ENUM_FILTER_OPERATOR_TYPE.eq,
  })
  operator: ENUM_FILTER_OPERATOR_TYPE;

  @ApiProperty({
    oneOf: [
      {
        enum: Object.values(ENUM_FILTER_OPERATOR_TYPE),
        default: ENUM_FILTER_OPERATOR_TYPE.eq,
      },
      { type: 'string' },
    ],
    required: false,
  })
  mode: string | REGEX_SEARCH_MODE_TYPE;
}

export class ProjectionDto extends projectionDto {
  @ApiProperty({ minLength: 2, maxLength: 20 })
  name: string;

  @ApiProperty({ minimum: 0, maximum: 1 })
  mode: number;
}

export class PaginateDto extends PartialType(PaginationDto) {
  @ApiPropertyOptional({
    type: () => StartKeyDto,
    isArray: true,
    minItems: 1,
    maxItems: 2,
  })
  start_key?: startKeyDto[];

  @ApiPropertyOptional({ minimum: 0, type: Number })
  skip?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100, type: Number })
  limit?: number;

  @ApiPropertyOptional({ type: () => SortDto })
  sort?: SortDto;

  @ApiPropertyOptional({ type: () => FilterDto, isArray: true })
  filter?: FilterDto[];

  @ApiPropertyOptional({ type: () => ProjectionDto, isArray: true })
  projection?: ProjectionDto[];
}
