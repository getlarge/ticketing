import { createSelector } from '@ngrx/store';

import { TicketStoreSelectors } from './ticket-store';
import { UserStoreSelectors } from './user-store';

export const selectError = createSelector(
  TicketStoreSelectors.selectTicketError,
  UserStoreSelectors.selectUserError,
  (ticketError: string, userError: string) => ticketError || userError
);

export const selectIsLoading = createSelector(
  TicketStoreSelectors.selectTicketIsLoading,
  UserStoreSelectors.selectUserIsLoading,
  (ticketLoading: boolean, userLoading: boolean) => ticketLoading || userLoading
);
