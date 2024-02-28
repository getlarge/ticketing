import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Ticket as TicketAttrs, TicketStatus } from '@ticketing/shared/models';
import type { Document, Model } from 'mongoose';

import { Moderation, ModerationDocument } from '../../moderations/schemas';

@Schema({
  toJSON: {
    transform(doc: TicketDocument, ret: TicketAttrs & { _id: string }) {
      ret.id = doc._id.toString();
      const { _id, ...rest } = ret;
      return rest;
    },
  },
})
export class Ticket
  implements Pick<TicketAttrs, 'title' | 'price' | 'status' | 'version'>
{
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

  @Prop({ type: Number, required: true, default: 0 })
  version: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(TicketStatus),
    default: TicketStatus.WaitingModeration,
  })
  status: TicketStatus;

  isModerated: () => Promise<boolean>;
}

export type TicketDocument = Ticket & Document;

export const TicketSchema = SchemaFactory.createForClass(Ticket);

export type TicketModel = Model<TicketDocument>;

TicketSchema.methods.isModerated = async function (): Promise<boolean> {
  const moderationModel = this.db.model(
    Moderation.name,
  ) as Model<ModerationDocument>;
  const existingModeration = await moderationModel.findOne({
    ticket: this as TicketDocument,
    // status: { $ne: ModerationStatus.Pending },
  });
  return !!existingModeration;
};
