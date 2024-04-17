import { Payment } from '@ticketing/shared/models';

import { Event } from './event';
import { Patterns } from './patterns';

export class PaymentCreatedEventData extends Payment {}

export class PaymentCreatedEvent implements Event {
  static readonly name = Patterns.PaymentCreated;
  static readonly data = PaymentCreatedEventData;
  name = PaymentCreatedEvent.name;
  data = new PaymentCreatedEvent.data();
}
