import { Payment } from '@ticketing/shared/models';

import { Event } from './event';
import { Patterns } from './patterns';

export class PaymentCreatedEvent implements Event {
  static readonly name = Patterns.PaymentCreated;
  static readonly data = Payment;
  name = PaymentCreatedEvent.name;
  data = new PaymentCreatedEvent.data();
}
