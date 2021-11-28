import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { omit } from 'lodash';
import { Document, Model } from 'mongoose';

import { Ticket as TicketAttrs, ticketContraints } from '../models';
@Schema({
  toJSON: {
    transform(doc: TicketDocument, ret: TicketAttrs) {
      ret.id = doc._id.toString();
      return omit(ret, ['_id']);
    },
  },
  versionKey: 'version',
})
export class Ticket implements TicketAttrs {
  @Prop({ type: String, virtual: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;

  @Prop({
    type: String,
    required: true,
    minlength: ticketContraints.title.min,
    maxlength: ticketContraints.title.max,
  })
  title: string;

  @Prop({ type: Number, required: true, min: ticketContraints.price.min })
  price: number;

  @Prop({ type: Number, virtual: true, default: 0 })
  version: number;

  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: false,
  })
  orderId?: string;
}

export type TicketDocument = Ticket & Document;

export const TicketSchema = SchemaFactory.createForClass(Ticket);

export interface TicketModel extends Model<TicketDocument> {
  build(attr: Omit<TicketAttrs, 'id'>): TicketDocument;
}
