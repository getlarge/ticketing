import { ActionsUnion, ActionTypes } from './actions';
import { featureAdapter, initialState, State } from './state';

// eslint-disable-next-line max-lines-per-function
export function featureReducer(
  state = initialState,
  action: ActionsUnion
): State {
  switch (action.type) {
    case ActionTypes.LOAD_TICKETS: {
      return {
        ...state,
        isLoading: true,
        error: undefined,
      };
    }
    case ActionTypes.LOAD_TICKETS_SUCCESS: {
      return featureAdapter.addMany(action.payload.tickets, {
        ...state,
        isLoading: false,
        error: undefined,
      });
    }
    case ActionTypes.LOAD_TICKETS_FAILURE: {
      return {
        ...state,
        isLoading: false,
        error: action.payload?.error,
      };
    }
    case ActionTypes.CREATE_TICKET: {
      return {
        ...state,
        isLoading: true,
        error: undefined,
      };
    }
    case ActionTypes.CREATE_TICKET_SUCCESS: {
      return featureAdapter.addOne(action.payload.ticket, {
        ...state,
        isLoading: false,
        error: undefined,
      });
    }
    case ActionTypes.CREATE_TICKET_FAILURE: {
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };
    }
    case ActionTypes.UPDATE_TICKET: {
      return {
        ...state,
        isLoading: true,
        error: undefined,
      };
    }
    case ActionTypes.UPDATE_TICKET_SUCCESS: {
      return featureAdapter.updateOne(action.payload.ticket, {
        ...state,
        isLoading: false,
        error: undefined,
      });
    }
    case ActionTypes.UPDATE_TICKET_FAILURE: {
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };
    }
    case ActionTypes.SELECT_TICKET: {
      return {
        ...state,
        currentTicketId: action.payload.ticketId,
      };
    }
    case ActionTypes.FILTER_TICKETS: {
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
