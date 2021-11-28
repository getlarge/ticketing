import { Expose, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

import { ticketConstraints } from './ticket';

export const orderConstraints = {};

export enum OrderStatus {
  Created = 'created',
  Cancelled = 'cancelled',
  AwaitingPayment = 'awaiting:payment',
  Complete = 'complete',
}

export class OrderTicket {
  @Expose()
  @IsMongoId()
  id: string;

  @Expose()
  @IsString({ message: 'title must be a string' })
  @Length(ticketConstraints.title.min, ticketConstraints.title.max)
  title: string;

  @Expose()
  @IsNumber()
  @Min(ticketConstraints.price.min)
  price: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  version: number;
}

export class Order {
  @Expose()
  @IsMongoId()
  id: string;

  @Expose()
  @Type(() => OrderTicket)
  @ValidateNested()
  @IsNotEmptyObject()
  ticket: OrderTicket;

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
