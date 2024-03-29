import { ActionsUnion, ActionTypes } from './actions';
import { featureAdapter, initialState, State } from './state';

// eslint-disable-next-line max-lines-per-function
export function featureReducer(
  state = initialState,
  action: ActionsUnion
): State {
  switch (action.type) {
    case ActionTypes.SIGN_UP:
    case ActionTypes.SIGN_IN:
    case ActionTypes.SIGN_OUT:
    case ActionTypes.LOAD_CURRENT_USER: {
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    }
    case ActionTypes.SIGN_UP_SUCCESS: {
      return featureAdapter.addOne(action.payload.user, {
        ...state,
        isLoading: false,
        error: null,
      });
    }
    case ActionTypes.SIGN_UP_FAILURE:
    case ActionTypes.SIGN_IN_FAILURE: {
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };
    }
    case ActionTypes.SIGN_IN_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        error: null,
        currentToken: action.payload.token,
        logoutUrl: action.payload.logoutUrl,
        session: action.payload.session,
      };
    }
    case ActionTypes.SIGN_OUT_SUCCESS: {
      return featureAdapter.removeOne(state.currentUser?.id as string, {
        ...state,
        isLoading: false,
        error: null,
        currentToken: undefined,
        currentUser: null,
        session: undefined,
        logoutUrl: '/',
      });
    }
    case ActionTypes.SIGN_OUT_FAILURE: {
      // do not show signout error
      return {
        ...state,
        isLoading: false,
        error: null,
        currentToken: undefined,
        currentUser: null,
        session: undefined,
        logoutUrl: '/',
      };
    }
    case ActionTypes.LOAD_CURRENT_USER_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        error: null,
        currentUser: action.payload.user,
      };
    }
    case ActionTypes.LOAD_CURRENT_USER_FAILURE: {
      // do not show current user loading error
      // console.error(action.payload.error);
      return {
        ...state,
        isLoading: false,
        error: null,
      };
    }
    default: {
      return state;
    }
  }
}
