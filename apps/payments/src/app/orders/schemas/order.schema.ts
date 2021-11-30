import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OrderStatus } from '@ticketing/shared/models';
import { omit } from 'lodash';
import { Document, Model } from 'mongoose';

import { Order as OrderAttrs } from '../models';

@Schema({
  toJSON: {
    transform(doc: OrderDocument, ret: OrderAttrs) {
      ret.id = doc._id.toString();
      return omit(ret, ['_id', '__v']);
    },
  },
  versionKey: 'version',
})
export class Order implements Omit<OrderAttrs, 'expiresAt'> {
  @Prop({ type: String, virtual: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;

  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created,
  })
  status: OrderStatus;

  @Prop({ type: Number })
  version: number;

  @Prop({ type: Number })
  price: number;
}

export type OrderDocument = Order & Document;

export const OrderSchema = SchemaFactory.createForClass(Order);

export interface OrderModel extends Model<OrderDocument> {
  build(attr: Omit<OrderAttrs, 'id'>): OrderDocument;
}
