import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Resources } from '@ticketing/shared/constants';
import { Order, User } from '@ticketing/shared/models';
import { Observable } from 'rxjs';

import { OrderFilter } from '../../models';
import {
  OrderStoreActions,
  OrderStoreSelectors,
  RootStoreState,
} from '../../store';

@Component({
  selector: 'ticketing-order-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class OrderListComponent implements OnInit {
  users$!: Observable<User[]>;
  orders$!: Observable<Order[]>;
  isLoading$!: Observable<boolean>;

  constructor(
    private store: Store<RootStoreState.RootState>,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.orders$ = this.store.select(OrderStoreSelectors.selectAllOrderItems);
    this.isLoading$ = this.store.select(
      OrderStoreSelectors.selectOrderIsLoading
    );
  }

  onViewOrder(orderId: string): void {
    this.router.navigate([`/${Resources.ORDERS}`, orderId]);
  }

  onCancelOrder(orderId: string): void {
    this.store.dispatch(new OrderStoreActions.CancelOrderAction({ orderId }));
  }

  onFilterOrder(filter: OrderFilter): void {
    this.store.dispatch(new OrderStoreActions.FilterOrdersAction({ filter }));
  }
}
