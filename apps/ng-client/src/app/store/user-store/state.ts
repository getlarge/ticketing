import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { User } from '@ticketing/shared/models';

import { LocalStorageService } from '../../services';

export const featureAdapter = createEntityAdapter<User>({
  selectId: (model) => model.id,
});

export interface State extends EntityState<User> {
  isLoading: boolean;
  error: string | null;
  currentUser: User | null;
  currentToken?: string;
}

export const initialState: State = featureAdapter.getInitialState({
  isLoading: false,
  error: null,
  currentUser: LocalStorageService.getObject('user'),
  currentToken: LocalStorageService.get('token'),
});
