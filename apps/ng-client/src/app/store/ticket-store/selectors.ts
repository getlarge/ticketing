import {
  createFeatureSelector,
  createSelector,
  DefaultProjectorFn,
  MemoizedSelector,
} from '@ngrx/store';
import { TicketDto } from '@ticketing/ng/open-api';

import { TicketFilter } from '../../models';
import { TICKETS_STORE } from '../constants';
import { featureAdapter, State } from './state';

export const selectTicketState = createFeatureSelector<State>(TICKETS_STORE);

export const selectAllTicketItems: (state: object) => TicketDto[] =
  featureAdapter.getSelectors(selectTicketState).selectAll;

export const selectTicketError = createSelector(
  selectTicketState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (state: State): any => state.error,
);

export const selectTicketIsLoading = createSelector(
  selectTicketState,
  (state: State): boolean => state.isLoading || false,
);

export const selectTicketCurrentTicketId = createSelector(
  selectTicketState,
  (state: State): string | undefined => state.currentTicketId,
);

export const selectTicketCurrentFilter = createSelector(
  selectTicketState,
  (state: State): TicketFilter => state.currentFilter,
);

export const selectAvailableTicketItems = createSelector(
  selectAllTicketItems,
  (items: TicketDto[]): TicketDto[] => items.filter((item) => !item.orderId),
);

export const selectFilteredTicketItems = createSelector(
  selectTicketCurrentFilter,
  selectAllTicketItems,
  (currentFilter: TicketFilter, items: TicketDto[]): TicketDto[] => {
    return items
      .filter(
        (item) =>
          currentFilter.userId == null || item.userId === currentFilter.userId,
      )
      .filter(
        (item) =>
          currentFilter.title == null ||
          new RegExp(currentFilter.title, 'gi').test(item.title),
      );
    // .filter(
    //   (item) =>
    //     currentFilter.onlyMine == null || item.userId === currentUser.id
    // );
    // .filter(
    //   (item) =>
    //     currentFilter.price == null ||
    //     item.price === currentFilter.price
    // );
  },
);

export const selectCurrentTicket = (): MemoizedSelector<
  object,
  TicketDto | undefined,
  DefaultProjectorFn<TicketDto | undefined>
> =>
  createSelector(
    selectTicketCurrentTicketId,
    selectAllTicketItems,
    (
      currentTicketId: string | undefined,
      items: TicketDto[],
    ): TicketDto | undefined => {
      return items.find((i) => i.id === currentTicketId);
    },
  );

export const selectTicketForId = (
  ticketId: string,
): MemoizedSelector<
  object,
  TicketDto | undefined,
  DefaultProjectorFn<TicketDto | undefined>
> =>
  createSelector(
    selectAllTicketItems,
    (items: TicketDto[]): TicketDto | undefined => {
      return items.find((i) => i.id === ticketId);
    },
  );
