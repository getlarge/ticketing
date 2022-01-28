import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  filterDto,
  PaginationDto,
  projectionDto,
  REGEX_MONGO_FIELD_NAME,
  startKeyDto,
} from 'nestjs-keyset-paginator';

// TODO: type field to be keyof model to be paginated
export class Sort {
  @IsString()
  @Matches(REGEX_MONGO_FIELD_NAME)
  @MinLength(2)
  @MaxLength(20)
  field: string;

  @Type(() => Number)
  @IsNumber()
  // 1 or -1
  order: number;
}

// TODO: name field to be keyof model to be paginated
export class Projection extends projectionDto {
  @Type(() => Number)
  mode: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformQueryArray(value: any): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.map((v) => (typeof v === 'string' ? JSON.parse(v) : v))
    : typeof value === 'string'
    ? [JSON.parse(value)]
    : value;
}

export class PaginateQuery extends PaginationDto {
  @Transform(({ value }) => transformQueryArray(value))
  start_key: startKeyDto[] = undefined;

  @Type(() => Number)
  skip: number = undefined;

  @Type(() => Number)
  limit: number = undefined;

  @Type(() => Sort)
  @ValidateNested()
  sort: Sort = undefined;

  @Transform(({ value }) => transformQueryArray(value))
  filter: filterDto[] = undefined;

  @Transform(({ value }) => transformQueryArray(value))
  projection: Projection[] = undefined;
}
