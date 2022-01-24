import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Ticket } from '@ticketing/shared/models';

@Component({
  selector: 'ticketing-ticket-list-grid',
  templateUrl: './ticket-list-grid.component.html',
  styleUrls: ['./ticket-list-grid.component.css'],
})
export class TicketListGridComponent {
  @Input() tickets!: Ticket[];
  @Input() isLoading!: boolean;

  @Output() view = new EventEmitter<string>();
  @Output() update = new EventEmitter<string>();
  @Output() order = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();

  readyToOrder(ticket: Ticket): boolean {
    return !ticket.orderId;
  }
}
