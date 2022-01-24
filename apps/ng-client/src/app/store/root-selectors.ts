import { createSelector } from '@ngrx/store';

import { OrderStoreSelectors } from './order-store';
import { TicketStoreSelectors } from './ticket-store';
import { UserStoreSelectors } from './user-store';

export const selectError = createSelector(
  TicketStoreSelectors.selectTicketError,
  UserStoreSelectors.selectUserError,
  OrderStoreSelectors.selectOrderError,
  (ticketError: string, userError: string, orderError: string) =>
    ticketError || userError || orderError
);

export const selectIsLoading = createSelector(
  TicketStoreSelectors.selectTicketIsLoading,
  UserStoreSelectors.selectUserIsLoading,
  OrderStoreSelectors.selectOrderIsLoading,
  (ticketLoading: boolean, userLoading: boolean, orderIsloading: boolean) =>
    ticketLoading || userLoading || orderIsloading
);
