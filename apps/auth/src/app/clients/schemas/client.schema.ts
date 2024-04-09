import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, ObjectId, Schema as MongooseSchema } from 'mongoose';

import { User } from '../../users/schemas';
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
export class Client extends ClientAttrs {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  user: User & Document;

  @Prop({ type: String, required: true, unique: true, index: true })
  declare clientId: string;
}

export type ClientDocument = Client & Document;

export const ClientSchema = SchemaFactory.createForClass(Client);

export interface ClientModel extends Model<ClientDocument> {
  build(attr: ClientAttrs): ClientDocument;
}
