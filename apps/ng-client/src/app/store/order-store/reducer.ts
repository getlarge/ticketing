import { ActionsUnion, ActionTypes } from './actions';
import { featureAdapter, initialState, State } from './state';

// eslint-disable-next-line max-lines-per-function
export function featureReducer(
  state = initialState,
  action: ActionsUnion
): State {
  switch (action.type) {
    case ActionTypes.LOAD_ORDERS: {
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    }
    case ActionTypes.LOAD_ORDERS_SUCCESS: {
      return featureAdapter.addMany(action.payload.orders, {
        ...state,
        isLoading: false,
        error: null,
      });
    }
    case ActionTypes.LOAD_ORDERS_FAILURE: {
      return {
        ...state,
        isLoading: false,
        error: action.payload?.error,
      };
    }
    case ActionTypes.SELECT_ORDER: {
      return {
        ...state,
        currentOrderId: action.payload.orderId,
      };
    }
    case ActionTypes.FILTER_ORDERS: {
      return {
        ...state,
        currentFilter: action.payload.filter,
      };
    }
    default: {
      return state;
    }
  }
}
