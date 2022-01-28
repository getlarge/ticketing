import {
  FilterDto,
  ProjectionDto,
  SortDto,
  StartKeyDto,
} from '@ticketing/ng/open-api';

export interface Paginate {
  start_key?: Array<StartKeyDto>;
  skip?: number;
  limit?: number;
  sort?: SortDto;
  filter?: Array<FilterDto>;
  projection?: Array<ProjectionDto>;
}
