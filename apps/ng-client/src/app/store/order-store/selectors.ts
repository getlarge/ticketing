import {
  createFeatureSelector,
  createSelector,
  DefaultProjectorFn,
  MemoizedSelector,
} from '@ngrx/store';
import { Order } from '@ticketing/shared/models';

import { OrderFilter } from '../../models';
import { ORDERS_STORE } from '../constants';
import { featureAdapter, State } from './state';

export const selectOrderState = createFeatureSelector<State>(ORDERS_STORE);

export const selectAllOrderItems: (state: object) => Order[] =
  featureAdapter.getSelectors(selectOrderState).selectAll;

export const selectOrderError = createSelector(
  selectOrderState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (state: State): any => state.error
);

export const selectOrderIsLoading = createSelector(
  selectOrderState,
  (state: State): boolean => state.isLoading || false
);

export const selectOrderCurrentOrderId = createSelector(
  selectOrderState,
  (state: State): string | null => state.currentOrderId
);

export const selectOrderCurrentFilter = createSelector(
  selectOrderState,
  (state: State): OrderFilter | null => state.currentFilter
);

export const selectFilteredTicketItems = createSelector(
  selectOrderCurrentFilter,
  selectAllOrderItems,
  (currentFilter: OrderFilter | null, items: Order[]): Order[] => {
    return items
      .filter(
        (item) =>
          currentFilter?.expiresAt == null ||
          item?.expiresAt == null ||
          new Date(item.expiresAt).getTime() <= currentFilter.expiresAt
      )
      .filter(
        (item) =>
          currentFilter?.status == null || item.status === currentFilter.status
      );
  }
);

export const selectCurrentOrder = (): MemoizedSelector<
  object,
  Order | undefined,
  DefaultProjectorFn<Order | undefined>
> =>
  createSelector(
    selectOrderCurrentOrderId,
    selectAllOrderItems,
    (currentOrderId: string | null, items: Order[]): Order | undefined => {
      return items.find((i) => i.id === currentOrderId);
    }
  );

export const selectOrderForId = (
  orderId: string
): MemoizedSelector<
  object,
  Order | undefined,
  DefaultProjectorFn<Order | undefined>
> =>
  createSelector(selectAllOrderItems, (items: Order[]): Order | undefined => {
    return items.find((i) => i.id === orderId);
  });
