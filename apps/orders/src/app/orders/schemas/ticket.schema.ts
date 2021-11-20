import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { omit } from 'lodash';
import { Document } from 'mongoose';

import { OrderStatus, Ticket as TicketAttrs } from '../models';
import { Order, OrderDocument } from './order.schema';

@Schema({
  toJSON: {
    transform(doc, ret: TicketAttrs) {
      ret.id = doc._id.toString();
      ret.version = doc.__v.toString();
      return omit(ret, ['_id', '__v']);
    },
  },
})
export class Ticket implements TicketAttrs {
  @Prop({ type: String, virtual: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;

  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({ type: Number, required: true, min: 0 })
  price: number;

  @Prop({ type: Number, virtual: true })
  version: number;

  isReserved: () => Promise<boolean>;
}

export type TicketDocument = Ticket & Document;

export const TicketSchema = SchemaFactory.createForClass(Ticket);

TicketSchema.methods.isReserved = async function (): Promise<boolean> {
  const orderModel = this.db.model<OrderDocument>(Order.name);
  const existingOrder = await orderModel.findOne({
    ticket: this as TicketDocument,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};
