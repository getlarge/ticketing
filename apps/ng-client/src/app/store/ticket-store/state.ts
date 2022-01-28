import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { NextPaginationDto } from '@ticketing/ng/open-api';
import { Ticket } from '@ticketing/shared/models';

import { Paginate, TicketFilter } from '../../models';

export const featureAdapter = createEntityAdapter<Ticket>({
  selectId: (model) => model.id,
});

export interface State extends EntityState<Ticket> {
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
