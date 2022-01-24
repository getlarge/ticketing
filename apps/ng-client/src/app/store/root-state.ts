import { OrderStoreState } from '.';
import { TicketStoreState } from './ticket-store';
import { UserStoreState } from './user-store';

export interface RootState {
  users: UserStoreState.State;
  tickets: TicketStoreState.State;
  orders: OrderStoreState.State;
}
