import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { NextPaginationDto, TicketDto } from '@ticketing/ng/open-api';

import { Paginate, TicketFilter } from '../../models';

export const featureAdapter = createEntityAdapter<TicketDto>({
  selectId: (model) => model.id,
});

export interface State extends EntityState<TicketDto> {
  isLoading: boolean;
  error: string | undefined;
  currentFilter: TicketFilter;
  pagination: Paginate | undefined;
  nextPagination: NextPaginationDto[] | undefined;
  currentTicketId: string | undefined;
}

export const initialState: State = featureAdapter.getInitialState({
  isLoading: false,
  error: undefined,
  currentFilter: {
    userId: null,
    price: null,
    title: null,
    onlyMine: false,
    onlyOthers: false,
  },
  pagination: undefined,
  nextPagination: undefined,
  currentTicketId: undefined,
});
