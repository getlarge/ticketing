import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, model } from 'mongoose';

import { Password } from '../../shared/password';
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

const userModel = model<UserDocument, UserModel>('User', UserSchema);
UserSchema.static('build', (attr: UserAttrs) => new userModel(attr));
UserSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hash = await Password.toHash(this.get('password'));
    this.set('password', hash);
  }
  done();
});
