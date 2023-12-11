import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { omit } from 'lodash';
import { Document, Model } from 'mongoose';

import { User as UserAttrs } from '../models';

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = doc._id.toString();
      return omit(ret, ['_id', 'password', '__v']);
    },
  },
})
export class User extends UserAttrs {
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  })
  email: string;

  @Prop({ type: String, required: true, unique: true })
  identityId: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

export interface UserModel extends Model<UserDocument> {
  build(attr: UserAttrs): UserDocument;
}
