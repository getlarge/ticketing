import { plainToInstance, Transform, Type } from 'class-transformer';
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
  declare mode: number;
}

// parse JSON string or 'key=value,key1=value1,...'
function parseQueryString(val: string): Record<string, unknown> {
  try {
    return JSON.parse(val);
  } catch (e) {
    return val
      .split(',')
      .map((s) => s.split('='))
      .reduce(function (accumulator, value) {
        accumulator[value[0]] = value[1];
        return accumulator;
      }, {});
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformQueryArray(value: any): Record<string, unknown>[] {
  if (typeof value === 'string') {
    return [parseQueryString(value)];
  }
  return Array.isArray(value)
    ? value.map((v) => (typeof v === 'string' ? parseQueryString(v) : v))
    : value;
}

export class PaginateQuery extends PaginationDto {
  @Transform(
    ({ value }) => plainToInstance(startKeyDto, transformQueryArray(value)),
    { toClassOnly: true },
  )
  // eslint-disable-next-line @typescript-eslint/naming-convention
  start_key: startKeyDto[] = undefined;

  @Type(() => Number)
  skip: number = undefined;

  @Type(() => Number)
  limit: number = undefined;

  @Type(() => Sort)
  @ValidateNested()
  sort: Sort = undefined;

  @Transform(
    ({ value }) => plainToInstance(filterDto, transformQueryArray(value)),
    { toClassOnly: true },
  )
  filter: filterDto[] = undefined;

  @Transform(
    ({ value }) => plainToInstance(Projection, transformQueryArray(value)),
    { toClassOnly: true },
  )
  projection: Projection[] = undefined;
}
