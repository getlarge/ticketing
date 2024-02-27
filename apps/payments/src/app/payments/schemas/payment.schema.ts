import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Payment as PaymentAttrs } from '../models';

@Schema({
  toJSON: {
    transform(
      doc: PaymentDocument,
      ret: PaymentAttrs & { _id: string; __v: number },
    ) {
      ret.id = doc._id.toString();
      const { _id, __v, ...rest } = ret;
      return rest;
    },
  },
  versionKey: 'version',
})
export class Payment implements PaymentAttrs {
  @Prop({ type: String, virtual: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;

  @Prop({
    type: String,
    required: true,
  })
  orderId: string;

  @Prop({
    type: String,
    required: true,
  })
  stripeId: string;

  @Prop({
    type: Number,
    required: false,
  })
  version: number;
}

export type PaymentDocument = Payment & Document;

export const PaymentSchema = SchemaFactory.createForClass(Payment);
