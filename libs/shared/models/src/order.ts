import { Expose } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
} from 'class-validator';

export const orderConstraints = {};

export enum OrderStatus {
  Created = 'created',
  Cancelled = 'cancelled',
  AwaitingPayment = 'awaiting:payment',
  Complete = 'complete',
}

export class Order {
  id: string;

  @Expose()
  @IsNotEmptyObject()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ticket: Record<string, any>;

  @Expose()
  @IsMongoId()
  userId: string;

  @Expose()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @Expose()
  @IsNumber()
  version: number;

  @Expose()
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
