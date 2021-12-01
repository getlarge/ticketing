/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigModule } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { loadEnv } from '@ticketing/microservices/shared/env';
import { Patterns } from '@ticketing/microservices/shared/events';
import { OrderStatus } from '@ticketing/shared/models';
import { Model } from 'mongoose';

import { OrdersModule } from '../src/app/orders/orders.module';
import { OrdersService } from '../src/app/orders/orders.service';
import { Order as OrderSchema, OrderDocument } from '../src/app/orders/schemas';
import {
  Ticket as TicketSchema,
  TicketDocument,
} from '../src/app/tickets/schemas';
import { envFilePath } from './constants';
import { mockTicketEvent } from './models/ticket.mock';

describe('OrdersService', () => {
  let app: TestingModule;
  let ordersService: OrdersService;
  let orderModel: Model<OrderDocument>;
  let ticketModel: Model<TicketDocument>;
  const envVariables = loadEnv(envFilePath, true);

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          expandVariables: true,
          envFilePath,
          load: [() => envVariables],
        }),
        OrdersModule,
        MongooseModule.forRoot(envVariables['MONGODB_URI']),
      ],
    }).compile();

    ordersService = app.get(OrdersService);
    orderModel = app.get<Model<OrderDocument>>(getModelToken(OrderSchema.name));
    ticketModel = app.get<Model<TicketDocument>>(
      getModelToken(TicketSchema.name)
    );
  });

  describe('expireById()', () => {
    it(`should expire a ticket, update status and send ${Patterns.OrderCancelled} event`, async () => {
      const ticketEvent = mockTicketEvent();
      ticketEvent.userId;
      const ticket = await ticketModel.create({
        ...ticketEvent,
        _id: ticketEvent.id,
      });
      const order = await orderModel.create({
        ticket,
        userId: ticketEvent.userId,
        expiresAt: new Date(),
        status: OrderStatus.Created,
      });
      ordersService.emitEvent = jest.fn();
      //
      const updatedOrder = await ordersService.expireById(order._id.toString());
      const updatedDBOrder = await orderModel.findById(order._id);
      expect(updatedDBOrder.status).toBe(OrderStatus.Cancelled);
      expect(ordersService.emitEvent).toBeCalledWith(
        Patterns.OrderCancelled,
        updatedOrder
      );
    });
  });
});
