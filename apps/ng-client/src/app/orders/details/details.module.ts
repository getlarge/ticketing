import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { OrderDetailsComponent } from './details.component';

@NgModule({
  declarations: [OrderDetailsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: OrderDetailsComponent }]),
  ],
})
export class DetailsModule {}
