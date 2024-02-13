import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, ObjectId, Schema as MongooseSchema } from 'mongoose';

import { Ticket } from '../../tickets/schemas';
import { Order as OrderAttrs, OrderStatus } from '../models';

@Schema({
  toJSON: {
    transform(
      doc: OrderDocument,
      ret: OrderAttrs & { _id: ObjectId; __v: number },
    ) {
      ret.id = doc._id.toString();
      ret.expiresAt = doc.expiresAt.toISOString();
      const { _id, __v, ...rest } = ret;
      return rest;
    },
  },
  versionKey: 'version',
})
export class Order implements Omit<OrderAttrs, 'expiresAt'> {
  @Prop({ type: String, virtual: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Ticket',
  })
  ticket: Ticket & Document;

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
