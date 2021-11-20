import { Expose } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateOrder {
  @Expose()
  @IsString({ message: 'ticketId must be a string' })
  @IsNotEmpty({ message: 'ticketId must be provided' })
  @IsMongoId()
  ticketId: string;
}
