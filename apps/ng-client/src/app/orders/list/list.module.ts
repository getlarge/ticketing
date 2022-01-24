import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { OrderListComponent } from './list.component';
import { OrderListGridComponent } from './order-list-grid/order-list-grid.component';

@NgModule({
  declarations: [OrderListComponent, OrderListGridComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: OrderListComponent }]),
  ],
})
export class ListModule {}
