import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AlertService } from '@ticketing/ng/alert';
import { Order, OrderStatus } from '@ticketing/shared/models';
import { Observable, Subject } from 'rxjs';

import {
  OrderStoreActions,
  OrderStoreSelectors,
  OrderStoreState,
} from '../../store';

@Component({
  selector: 'ticketing-order-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  order$!: Observable<Order | undefined>;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store<OrderStoreState.State>,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.order$ = this.store.select(OrderStoreSelectors.selectCurrentOrder());
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.store.dispatch(new OrderStoreActions.SelectOrderAction({ orderId }));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  payOrder(order: Order): void {
    // this.store.dispatch(
    //   new OrderStoreActions.PayOrderAction({ orderId: order.id })
    // );
  }

  cancelOrder(order: Order): void {
    this.store.dispatch(
      new OrderStoreActions.CancelOrderAction({ orderId: order.id })
    );
  }

  expiresIn(order: Order): string {
    return order.expiresAt?.toString() || '';
  }

  isCreated(order: Order): boolean {
    return order.status === OrderStatus.Created;
  }
}
