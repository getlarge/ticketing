import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Ticket as TicketAttrs,
  ticketContraints,
} from '@ticketing/shared/models';
import { omit } from 'lodash';
import { Document, Model } from 'mongoose';

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = doc._id;
      return omit(ret, ['_id', '__v']);
    },
  },
})
export class Ticket implements TicketAttrs {
  @Prop({ type: String, virtual: true })
  id: string;

  @Prop({
    type: String,
    required: true,
    minlength: ticketContraints.title.min,
    maxlength: ticketContraints.title.max,
  })
  title: string;

  @Prop({ type: Number, required: true, min: ticketContraints.price.min })
  price: number;

  @Prop({
    type: String,
    required: true,
  })
  userId: string;
}

export type TicketDocument = Ticket & Document;

export const TicketSchema = SchemaFactory.createForClass(Ticket);

export interface TicketModel extends Model<TicketDocument> {
  build(attr: Omit<TicketAttrs, 'id'>): TicketDocument;
}
