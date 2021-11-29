import { Order } from '@ticketing/shared/models';

import { Event } from './event';
import { Patterns } from './patterns';

export interface ExpirationCompletedEvent extends Event {
  name: Patterns.ExpirationCompleted;
  data: Pick<Order, 'id'>;
}
