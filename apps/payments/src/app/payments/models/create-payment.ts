import { Expose } from 'class-transformer';
import { IsMongoId, IsString } from 'class-validator';

export class CreatePayment {
  @Expose()
  @IsMongoId()
  orderId: string;

  @Expose()
  @IsString()
  token: string;
}
