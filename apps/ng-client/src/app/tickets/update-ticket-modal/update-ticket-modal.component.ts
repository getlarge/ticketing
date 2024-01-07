import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ActionsSubject, Store } from '@ngrx/store';
import { TicketDto, UpdateTicketDto } from '@ticketing/ng/open-api';
import { Observable } from 'rxjs';

import {
  RootStoreState,
  TicketStoreActions,
  TicketStoreSelectors,
} from '../../store';

@Component({
  selector: 'ticketing-create-ticket-modal',
  templateUrl: './update-ticket-modal.component.html',
})
export class UpdateTicketModalComponent implements OnInit {
  @Input() ticketId!: string | null;

  ticket$!: Observable<TicketDto | undefined>;

  ticketPrice = 0;
  ticketTitle = '';

  constructor(
    private store: Store<RootStoreState.RootState>,
    private activeModal: NgbActiveModal,
    private actionsSubj: ActionsSubject,
  ) {}

  ngOnInit(): void {
    if (this.ticketId) {
      this.store.dispatch(
        new TicketStoreActions.LoadTicketAction({ ticketId: this.ticketId }),
      );
      this.ticket$ = this.store.select(
        TicketStoreSelectors.selectTicketForId(this.ticketId),
      );
    }
  }

  update(): void {
    const ticket: UpdateTicketDto = {
      price: this.ticketPrice,
      title: this.ticketTitle,
    };
    if (this.ticketId) {
      this.store.dispatch(
        new TicketStoreActions.UpdateTicketAction({
          ticketId: this.ticketId,
          ticket,
        }),
      );
      this.activeModal.close();
    }
  }

  cancel(): void {
    this.activeModal.close();
  }
}
