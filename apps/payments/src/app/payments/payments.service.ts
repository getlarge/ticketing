import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import {
  Patterns,
  PaymentCreatedEvent,
} from '@ticketing/microservices/shared/events';
import { transactionManager } from '@ticketing/microservices/shared/mongo';
import { OrderStatus, User } from '@ticketing/shared/models';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';

import { Order as OrderSchema, OrderDocument } from '../orders/schemas';
import { ORDERS_CLIENT } from '../shared/constants';
import { CreatePayment, Payment } from './models';
import { Payment as PaymentSchema, PaymentDocument } from './schemas';
import { StripeService } from './stripe.service';

@Injectable()
export class PaymentsService {
  readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(OrderSchema.name) private orderModel: Model<OrderDocument>,
    @InjectModel(PaymentSchema.name)
    private paymentModel: Model<PaymentDocument>,
    @Inject(StripeService) private readonly stripeService: StripeService,
    @Inject(ORDERS_CLIENT) private client: ClientProxy,
  ) {}

  // TODO: add safe guard to avoid double payment
  async create(
    paymentRequest: CreatePayment,
    currentUser: User,
  ): Promise<Payment> {
    const { orderId, token } = paymentRequest;
    // 1. find the order the user is trying to pay for
    const order = await this.orderModel.findOne({ _id: orderId });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    // 2. make sure the order belongs to the user
    if (order.userId !== currentUser.id) {
      throw new UnauthorizedException(
        `User ${currentUser.id} is not a valid owner`,
      );
    }
    // 3. make sure the order is not cancelled
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestException(
        `Order ${orderId} has been cancelled and can't be paid for`,
      );
    }

    // 4. make sure the payment amount match the order price and create payment with Stripe
    const charge = await this.stripeService.charges.create(
      {
        amount: order.price * 100,
        currency: 'eur',
        source: token,
      },
      {
        // idempotencyKey: orderId,
      },
    );

    await using manager = await transactionManager(this.paymentModel);
    const result = await manager.wrap(async (session) => {
      // 5. Create charge instance in Mongo
      const res = await this.paymentModel.create(
        [
          {
            orderId,
            stripeId: charge.id,
          },
        ],
        { session },
      );
      const payment = res[0].toJSON<Payment>();
      // 6. emit payment:create event
      await firstValueFrom(
        this.client.emit<
          PaymentCreatedEvent['name'],
          PaymentCreatedEvent['data']
        >(Patterns.PaymentCreated, payment),
      );
      return payment;
    });
    if (result.error) {
      throw result.error;
    }
    return result.value;
  }
}
