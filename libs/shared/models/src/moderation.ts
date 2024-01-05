import { Expose, Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNotEmptyObject, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { Ticket } from './ticket';

export class ModerationTicket implements Pick<Ticket, 'id' | 'title' | 'price' | 'version'> {
  @Expose()
  @IsMongoId()
  id: string;

  @Expose()
  @IsString({ message: 'title must be a string' })
  title: string;

  @Expose()
  @IsNumber()
  price: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  version: number;
}


export enum ModerationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export class Moderation {
  @Expose()
  @IsMongoId()
  id: string;

  @Expose()
  @IsEnum(ModerationStatus)
  status: ModerationStatus = ModerationStatus.Pending;

  @Expose()
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @Expose()
  @Type(() => ModerationTicket)
  @ValidateNested()
  @IsNotEmptyObject()
  ticket: ModerationTicket;

  @Expose()
  @IsOptional()
  @IsMongoId()
  moderatorId?: string;
}
