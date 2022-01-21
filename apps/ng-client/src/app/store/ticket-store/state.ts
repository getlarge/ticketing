import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Ticket } from '@ticketing/shared/models';

import { TicketFilter } from '../../models';

export const featureAdapter = createEntityAdapter<Ticket>({
  selectId: (model) => model.id,
});

export interface State extends EntityState<Ticket> {
  isLoading: boolean;
  error: string | null;
  currentFilter: TicketFilter;
  currentTicketId: string | null;
}

export const initialState: State = featureAdapter.getInitialState({
  isLoading: false,
  error: null,
  currentFilter: {
    userId: null,
    price: null,
    title: null,
  },
  currentTicketId: null,
});
