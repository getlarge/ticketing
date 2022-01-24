import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Order, OrderStatus } from '@ticketing/shared/models';

@Component({
  selector: 'ticketing-order-list-grid',
  templateUrl: './order-list-grid.component.html',
  styleUrls: ['./order-list-grid.component.css'],
})
export class OrderListGridComponent {
  @Input() orders!: Order[];
  @Input() isLoading!: boolean;

  @Output() view = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();

  isCreated(order: Order): boolean {
    return order.status === OrderStatus.Created;
  }
}
