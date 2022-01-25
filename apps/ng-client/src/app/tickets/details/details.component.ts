import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { AlertService } from '@ticketing/ng/alert';
import { Resources } from '@ticketing/shared/constants';
import { Ticket } from '@ticketing/shared/models';
import { Observable, Subject, takeUntil } from 'rxjs';

import {
  OrderStoreActions,
  RootStoreState,
  TicketStoreActions,
  TicketStoreSelectors,
} from '../../store';

@Component({
  selector: 'ticketing-ticket-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class TicketDetailsComponent implements OnInit, OnDestroy {
  ticket$!: Observable<Ticket | undefined>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  Resources = Resources;

  constructor(
    private store: Store<RootStoreState.RootState>,
    private router: Router,
    private actionsSubj: ActionsSubject,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.ticket$ = this.store.select(
      TicketStoreSelectors.selectCurrentTicket()
    );

    const ticketId = this.route.snapshot.paramMap.get('id');
    if (ticketId) {
      this.store.dispatch(
        // new TicketStoreActions.LoadTicketAction({ ticketId })
        new TicketStoreActions.SelectTicketAction({ ticketId })
      );
    }

    this.actionsSubj
      .pipe(
        takeUntil(this.destroy$),
        ofType<OrderStoreActions.CreateOrderSuccessAction>(
          OrderStoreActions.ActionTypes.CREATE_ORDER_SUCCESS
        )
      )
      .subscribe({
        next: ({ payload }) => {
          this.alertService.success('Order created', {
            keepAfterRouteChange: true,
            autoClose: true,
          });
          this.router.navigate([`/${Resources.ORDERS}/`, payload.order.id]);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  purchaseTicket(ticket: Ticket): void {
    this.store.dispatch(
      new OrderStoreActions.CreateOrderAction({ ticketId: ticket.id })
    );
  }

  isAvailable(ticket: Ticket): boolean {
    return !ticket.orderId;
  }
}
