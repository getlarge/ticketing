import { ActionsUnion, ActionTypes } from './actions';
import { featureAdapter, initialState, State } from './state';

// eslint-disable-next-line max-lines-per-function
export function featureReducer(
  state = initialState,
  action: ActionsUnion
): State {
  switch (action.type) {
    case ActionTypes.CREATE_ORDER: {
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    }
    case ActionTypes.CREATE_ORDER_SUCCESS: {
      return featureAdapter.addOne(action.payload.order, {
        ...state,
        isLoading: false,
        error: null,
      });
    }
    case ActionTypes.CREATE_ORDER_FAILURE: {
      return {
        ...state,
        isLoading: false,
        error: action.payload?.error,
      };
    }
    case ActionTypes.CANCEL_ORDER: {
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    }
    case ActionTypes.CANCEL_ORDER_SUCCESS: {
      return featureAdapter.updateOne(action.payload.order, {
        ...state,
        isLoading: false,
        error: null,
      });
    }
    case ActionTypes.CANCEL_ORDER_FAILURE: {
      return {
        ...state,
        isLoading: false,
        error: action.payload?.error,
      };
    }
    case ActionTypes.LOAD_ORDERS: {
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    }
    case ActionTypes.LOAD_ORDERS_SUCCESS: {
      return featureAdapter.setAll(action.payload.orders, {
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
    case ActionTypes.LOAD_ORDER: {
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    }
    case ActionTypes.LOAD_ORDER_SUCCESS: {
      return featureAdapter.setOne(action.payload.order, {
        ...state,
        isLoading: false,
        error: null,
      });
    }
    case ActionTypes.LOAD_ORDER_FAILURE: {
      return {
        ...state,
        isLoading: false,
        error: action.payload?.error,
      };
    }
    case ActionTypes.PAY_ORDER: {
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    }
    case ActionTypes.PAY_ORDER_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        error: null,
      };
    }
    case ActionTypes.PAY_ORDER_FAILURE: {
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
