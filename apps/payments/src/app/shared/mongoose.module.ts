import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { Order, OrderSchema } from '../orders/schemas';

export const MongooseFeatures = MongooseModule.forFeatureAsync([
  {
    name: Order.name,
    useFactory: () => {
      const schema = OrderSchema;
      schema.plugin(updateIfCurrentPlugin);
      return schema;
    },
    inject: [ConfigService],
  },
]);
