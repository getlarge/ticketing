/* tslint:disable */
/* eslint-disable */
import { FilterOperatorType } from './filter-operator-type';
export interface FilterDto {
  arr_value?: (string | number);
  mode?: ('eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'regex' | 'in' | 'nin' | string);
  name: string;
  operator: FilterOperatorType;
  value: string;
}
