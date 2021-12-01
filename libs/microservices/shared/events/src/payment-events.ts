import { Payment } from '@ticketing/shared/models';

import { Event } from './event';
import { Patterns } from './patterns';

export interface PaymentCreatedEvent extends Event {
  name: Patterns.PaymentCreated;
  data: Payment;
}
