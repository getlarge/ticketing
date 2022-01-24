import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Order } from '@ticketing/shared/models';

import { OrderFilter } from '../../models';

export const featureAdapter = createEntityAdapter<Order>({
  selectId: (model) => model.id,
});

export interface State extends EntityState<Order> {
  isLoading: boolean;
  error: string | null;
  currentFilter: OrderFilter | null;
  currentOrderId: string | null;
}

export const initialState: State = featureAdapter.getInitialState({
  isLoading: false,
  error: null,
  currentFilter: null,
  currentOrderId: null,
});
