import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Ticket } from '@ticketing/shared/models';
import { Observable } from 'rxjs';

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
export class TicketDetailsComponent implements OnInit {
  ticket$!: Observable<Ticket | undefined>;

  constructor(
    private store: Store<TicketStoreState.State>,
    private route: ActivatedRoute
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
  }
}
