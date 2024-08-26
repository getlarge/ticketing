import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  type UserDocument,
  USER_COLLECTION,
} from '@ticketing/microservices/auth/users';
import { Document, Model, ObjectId, Schema as MongooseSchema } from 'mongoose';

import { Client as ClientAttrs } from '../models';

@Schema({
  toJSON: {
    transform(
      doc: ClientDocument,
      ret: ClientAttrs & { _id: ObjectId; __v: number },
    ) {
      ret.id = doc._id.toString();
      ret.userId = doc.user._id.toString();
      const { _id, __v, ...rest } = ret;
      return rest;
    },
  },
})
class Client extends ClientAttrs {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: USER_COLLECTION,
  })
  user!: UserDocument;

  @Prop({ type: String, required: true, unique: true, index: true })
  declare clientId: string;
}

export type ClientDocument = Client & Document;

export const ClientSchema = SchemaFactory.createForClass(Client);

export interface ClientModel extends Model<ClientDocument> {
  build(attr: ClientAttrs): ClientDocument;
}

export const CLIENT_COLLECTION = Client.name;
