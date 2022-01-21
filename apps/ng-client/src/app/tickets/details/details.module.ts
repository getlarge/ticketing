import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TicketDetailsComponent } from './details.component';

@NgModule({
  declarations: [TicketDetailsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: TicketDetailsComponent }]),
  ],
})
export class DetailsModule {}
