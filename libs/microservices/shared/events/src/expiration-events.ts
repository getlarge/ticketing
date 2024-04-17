import { PickType } from '@nestjs/mapped-types';
import { Order } from '@ticketing/shared/models';

import { Event } from './event';
import { Patterns } from './patterns';

export class ExpirationCompletedEventData extends PickType(Order, ['id']) {}

export class ExpirationCompletedEvent implements Event {
  static readonly name = Patterns.ExpirationCompleted;
  static readonly data = ExpirationCompletedEventData;
  name = ExpirationCompletedEvent.name;
  data = new ExpirationCompletedEvent.data();
}
