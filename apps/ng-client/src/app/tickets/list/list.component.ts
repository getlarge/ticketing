import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Resources } from '@ticketing/shared/constants';
import { Ticket, User } from '@ticketing/shared/models';
import { Observable, of } from 'rxjs';

import { TicketFilter } from '../../models';
import {
  OrderStoreActions,
  RootStoreState,
  TicketStoreActions,
  TicketStoreSelectors,
} from '../../store';
import { CreateTicketModalComponent } from '../create-ticket-modal/create-ticket-modal.component';
import { UpdateTicketModalComponent } from '../update-ticket-modal/update-ticket-modal.component';

@Component({
  selector: 'ticketing-ticket-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class TicketListComponent implements OnInit {
  users$!: Observable<User[]>;
  tickets$!: Observable<Ticket[]>;
  currentFilter$!: Observable<TicketFilter>;
  isLoading$!: Observable<boolean>;

  constructor(
    private store: Store<RootStoreState.RootState>,
    private router: Router,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    //? TODO: only show available tickets with TicketStoreSelectors.selectAvailableTicketItems
    this.tickets$ = this.store.select(
      TicketStoreSelectors.selectAllTicketItems,
    );
    this.currentFilter$ = this.store.select(
      TicketStoreSelectors.selectTicketCurrentFilter,
    );
    this.isLoading$ = this.store.select(
      TicketStoreSelectors.selectTicketIsLoading,
    );
    this.users$ = of([]);
    this.store.dispatch(new TicketStoreActions.LoadTicketsAction());
  }

  createTicket(): void {
    this.modalService.open(CreateTicketModalComponent);
  }

  onViewTicket(ticketId: string): void {
    void this.router.navigate([`/${Resources.TICKETS}`, ticketId]);
  }

  onUpdateTicket(ticketId: string): void {
    // TODO: add basic permission check
    const modalRef = this.modalService.open(UpdateTicketModalComponent);
    modalRef.componentInstance.ticketId = ticketId;
  }

  onOrderTicket(ticketId: string): void {
    this.store.dispatch(new OrderStoreActions.CreateOrderAction({ ticketId }));
  }

  onCancelOrder(orderId: string): void {
    this.store.dispatch(new OrderStoreActions.CancelOrderAction({ orderId }));
  }

  onFilterTickets(filter: TicketFilter): void {
    this.store.dispatch(new TicketStoreActions.FilterTicketsAction({ filter }));
  }
}
