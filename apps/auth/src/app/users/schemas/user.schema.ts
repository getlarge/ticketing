import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

import { User as UserAttrs } from '../models';

@Schema()
export class User extends UserAttrs {
  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

export interface UserModel extends Model<UserDocument> {
  build(attr: UserAttrs): UserDocument;
}
