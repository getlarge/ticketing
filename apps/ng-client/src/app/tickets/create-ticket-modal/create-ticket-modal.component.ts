import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { CreateTicketDto } from '@ticketing/ng/open-api';

import { RootStoreState, TicketStoreActions } from '../../store';

@Component({
  selector: 'ticketing-create-ticket-modal',
  templateUrl: './create-ticket-modal.component.html',
  styleUrls: ['./create-ticket-modal.component.css'],
})
export class CreateTicketModalComponent {
  newTicketPrice = 0;
  newTicketTitle = '';

  constructor(
    private store: Store<RootStoreState.RootState>,
    private activeModal: NgbActiveModal
  ) {}

  create(): void {
    const newTicket: CreateTicketDto = {
      price: this.newTicketPrice,
      title: this.newTicketTitle,
    };

    this.store.dispatch(
      new TicketStoreActions.AddTicketAction({
        newTicket,
      })
    );
    this.activeModal.close();
  }

  cancel(): void {
    this.activeModal.close();
  }
}
