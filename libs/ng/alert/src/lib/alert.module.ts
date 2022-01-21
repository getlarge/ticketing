import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AlertComponent } from './alert.component';
import { AlertService } from './alert.service';

@NgModule({
  imports: [CommonModule],
  declarations: [AlertComponent],
  providers: [AlertService],
  exports: [AlertComponent],
})
export class AlertModule {}
