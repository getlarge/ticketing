import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Moderation as ModerationAttrs,
  ModerationStatus,
} from '@ticketing/shared/models';
import { omit } from 'lodash-es';
import { Document, Model, Schema as MongooseSchema } from 'mongoose';

import { Ticket } from '../../tickets/schemas';

@Schema({
  toJSON: {
    transform(doc: ModerationDocument, ret: ModerationAttrs) {
      ret.id = doc._id.toString();
      return omit(ret, ['_id', '__v']);
    },
  },
})
export class Moderation implements ModerationAttrs {
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
    enum: Object.values(ModerationStatus),
    default: ModerationStatus.Pending,
  })
  status: ModerationStatus;

  @Prop({
    type: String,
    required: false,
  })
  moderatorId?: string;

  @Prop({
    type: String,
    required: false,
  })
  rejectionReason?: string;
}

export type ModerationDocument = Moderation & Document;

export const ModerationSchema = SchemaFactory.createForClass(Moderation);

export interface ModerationModel extends Model<ModerationDocument> {
  build(attr: Omit<ModerationAttrs, 'id'>): ModerationDocument;
}
