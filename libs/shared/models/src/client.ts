import { Expose } from 'class-transformer';
import { IsMongoId, IsUUID } from 'class-validator';

export class Client {
  @Expose()
  @IsMongoId()
  id: string;

  @Expose()
  @IsUUID()
  clientId: string;

  @Expose()
  @IsMongoId()
  userId: string;
}
