import 'reflect-metadata';

import { OrderStatus } from '@ticketing/shared/models';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Types } from 'mongoose';

import { OrderCreatedEvent } from './order-events';
import { Patterns } from './patterns';

describe('OrderCreatedEvent', () => {
  it('should be defined', () => {
    expect(new OrderCreatedEvent()).toBeDefined();
  });

  it('should have name OrderCreated', () => {
    expect(new OrderCreatedEvent().name).toBe(Patterns.OrderCreated);
  });

  it('should have data', () => {
    expect(new OrderCreatedEvent().data).toBeDefined();
  });

  it('should be useable to validate instance', async () => {
    const event = plainToInstance(OrderCreatedEvent.data, {
      id: new Types.ObjectId().toHexString(),
      userId: new Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      version: 0,
      expiresAt: new Date().toISOString(),
    });

    const errors = await validate(event);
    expect(errors).toHaveLength(0);
  });
});
