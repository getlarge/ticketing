import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CreateTicketModalComponent } from '../create-ticket-modal/create-ticket-modal.component';
import { TicketListComponent } from './list.component';
import { TicketListFilterFormComponent } from './ticket-list-filter-form/ticket-list-filter-form.component';
import { TicketListGridComponent } from './ticket-list-grid/ticket-list-grid.component';

@NgModule({
  declarations: [
    TicketListComponent,
    TicketListFilterFormComponent,
    TicketListGridComponent,
    CreateTicketModalComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: TicketListComponent }]),
  ],
  entryComponents: [CreateTicketModalComponent],
})
export class ListModule {}
