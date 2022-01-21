import {
  createFeatureSelector,
  createSelector,
  DefaultProjectorFn,
  MemoizedSelector,
} from '@ngrx/store';
import { User } from '@ticketing/shared/models';

import { featureAdapter, State } from './state';

export const selectUserState = createFeatureSelector<State>('users');

export const selectAllUsers: (state: object) => User[] =
  featureAdapter.getSelectors(selectUserState).selectAll;

export const selectUserError = createSelector(
  selectUserState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (state: State): any => state.error
);

export const selectUserIsLoading = createSelector(
  selectUserState,
  (state: State): boolean => state.isLoading || false
);

export const selectCurrentUser = createSelector(
  selectUserState,
  (state: State): User | null => state.currentUser
);

export const selectCurrentToken = createSelector(
  selectUserState,
  (state: State): string | undefined => state.currentToken
);

export const selectUserForId = (
  userId: string
): MemoizedSelector<
  object,
  User | undefined,
  DefaultProjectorFn<User | undefined>
> =>
  createSelector(selectAllUsers, (items: User[]): User | undefined =>
    items.find((i) => i.id === userId)
  );
