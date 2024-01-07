import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { OryPermissionsService } from '@ticketing/microservices/ory-client';
import {
  Patterns,
  PaymentCreatedEvent,
} from '@ticketing/microservices/shared/events';
import { PermissionNamespaces } from '@ticketing/microservices/shared/models';
import { transactionManager } from '@ticketing/microservices/shared/mongo';
import { RelationTuple } from '@ticketing/microservices/shared/relation-tuple-parser';
import { Resources } from '@ticketing/shared/constants';
import { OrderStatus, User } from '@ticketing/shared/models';
import { Model } from 'mongoose';
import { firstValueFrom, timeout } from 'rxjs';

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
    @Inject(OryPermissionsService)
    private readonly oryPermissionsService: OryPermissionsService,
    @Inject(StripeService) private readonly stripeService: StripeService,
    @Inject(ORDERS_CLIENT) private client: ClientProxy,
  ) {}

  private async createRelationShip(
    relationTuple: RelationTuple,
  ): Promise<void> {
    const relationShipCreated =
      await this.oryPermissionsService.createRelation(relationTuple);
    if (!relationShipCreated) {
      throw new BadRequestException(
        `Could not create relation ${relationTuple}`,
      );
    }
    this.logger.debug(`Created relation ${relationTuple.toString()}`);
  }

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
    // 2. make sure the order is not cancelled
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestException(
        `Order ${orderId} has been cancelled and can't be paid for`,
      );
    }

    // 3. make sure the payment amount match the order price and create payment with Stripe
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
      // 4. Create charge instance in Mongo
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
      // 5. create a relation between the order and the payment
      const relationTupleWithOrder = new RelationTuple(
        PermissionNamespaces[Resources.PAYMENTS],
        payment.id,
        'parents',
        {
          namespace: PermissionNamespaces[Resources.ORDERS],
          object: orderId,
        },
      );
      await this.createRelationShip(relationTupleWithOrder);

      // 6. create a relation between the user and the payment
      const relationTupleWithUser = new RelationTuple(
        PermissionNamespaces[Resources.PAYMENTS],
        payment.id,
        'owners',
        {
          namespace: PermissionNamespaces[Resources.USERS],
          object: currentUser.id,
        },
      );
      await this.createRelationShip(relationTupleWithUser);

      // 7. send payment:create event
      await firstValueFrom(
        this.client
          .send<PaymentCreatedEvent['name'], PaymentCreatedEvent['data']>(
            Patterns.PaymentCreated,
            payment,
          )
          .pipe(timeout(5000)),
      );
      return payment;
    });
    if (result.error) {
      throw result.error;
    }
    return result.value;
  }
}
