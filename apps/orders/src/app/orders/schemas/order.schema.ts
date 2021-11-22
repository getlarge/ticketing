import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { omit } from 'lodash';
import { Document, Model, Schema as MongooseSchema } from 'mongoose';

import { TicketDocument } from '../../tickets/schemas';
import { Order as OrderAttrs, OrderStatus } from '../models';

@Schema({
  toJSON: {
    transform(doc: OrderDocument, ret: OrderAttrs) {
      ret.id = doc._id.toString();
      ret.expiresAt = doc.expiresAt.toISOString();
      // ret.version = doc.__v.toString();
      return omit(ret, ['_id', '__v']);
    },
  },
})
export class Order implements Omit<OrderAttrs, 'expiresAt'> {
  @Prop({ type: String, virtual: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Ticket',
  })
  ticket: TicketDocument;

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

  @Prop({
    type: MongooseSchema.Types.Date,
    required: false,
  })
  expiresAt?: Date;
}

export type OrderDocument = Order & Document;

export const OrderSchema = SchemaFactory.createForClass(Order);

export interface OrderModel extends Model<OrderDocument> {
  build(attr: Omit<OrderAttrs, 'id'>): OrderDocument;
}
