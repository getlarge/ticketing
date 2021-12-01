import { Expose } from 'class-transformer';
import { IsMongoId, IsNumber, IsString } from 'class-validator';

export class Payment {
  @Expose()
  @IsMongoId()
  id: string;

  @Expose()
  @IsMongoId()
  orderId: string;

  @Expose()
  @IsString()
  stripeId: string;

  @Expose()
  @IsNumber()
  version: number;
}
