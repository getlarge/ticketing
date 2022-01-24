import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { AlertService } from '@ticketing/ng/alert';
import { Ticket } from '@ticketing/shared/models';
import { Observable, Subject, takeUntil } from 'rxjs';

import {
  TicketStoreActions,
  TicketStoreSelectors,
  TicketStoreState,
} from '../../store';

@Component({
  selector: 'ticketing-ticket-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class TicketDetailsComponent implements OnInit, OnDestroy {
  ticket$!: Observable<Ticket | undefined>;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store<TicketStoreState.State>,
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
        new TicketStoreActions.SelectTicketAction({ ticketId })
      );
    }

    this.actionsSubj
      .pipe(
        takeUntil(this.destroy$),
        ofType(TicketStoreActions.ActionTypes.ORDER_TICKET_SUCCESS)
      )
      .subscribe({
        next: () => {
          this.alertService.success('Order created', {
            keepAfterRouteChange: true,
            autoClose: true,
          });
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  purchaseTicket(ticket: Ticket): void {
    this.store.dispatch(
      new TicketStoreActions.OrderTicketAction({ ticketId: ticket.id })
    );
  }
}
