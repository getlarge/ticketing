import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

import { User as UserAttrs } from '../models';

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = doc._id.toString();
      const { _id, __v, ...rest } = ret;
      return rest;
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
  declare email: string;

  @Prop({ type: String, required: false, unique: true })
  declare identityId: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

export interface UserModel extends Model<UserDocument> {
  build(attr: UserAttrs): UserDocument;
}
