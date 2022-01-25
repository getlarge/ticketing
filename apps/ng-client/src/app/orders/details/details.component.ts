import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Resources } from '@ticketing/shared/constants';
import { Order, OrderStatus } from '@ticketing/shared/models';
import { filter, interval, map, Observable, Subject, switchMap } from 'rxjs';

import { PaymentModalComponent } from '../../payments/payment-modal.component';
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
  expiresIn$!: Observable<number>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  Resources = Resources;

  constructor(
    private store: Store<OrderStoreState.State>,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.order$ = this.store.select(OrderStoreSelectors.selectCurrentOrder());
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.store.dispatch(new OrderStoreActions.LoadOrderAction({ orderId }));
      this.store.dispatch(new OrderStoreActions.SelectOrderAction({ orderId }));
    }

    this.expiresIn$ = interval(1000).pipe(
      switchMap(() => this.order$),
      filter((order) => !!order),
      map((order) => this.expiresIn(order as Order))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  payOrder(): void {
    this.modalService.open(PaymentModalComponent);
  }

  cancelOrder(order: Order): void {
    this.store.dispatch(
      new OrderStoreActions.CancelOrderAction({ orderId: order.id })
    );
  }

  expiresIn(order: Order): number {
    if (order.expiresAt) {
      let diff = new Date(order.expiresAt).getTime() - new Date().getTime();
      if (diff < 0) {
        diff = 0;
      }
      return Math.round(diff / 1000);
    }
    return 0;
  }

  isCreated(order: Order): boolean {
    return order.status === OrderStatus.Created;
  }

  isCancelled(order: Order): boolean {
    return order.status === OrderStatus.Cancelled;
  }

  isComplete(order: Order): boolean {
    return order.status === OrderStatus.Complete;
  }
}
