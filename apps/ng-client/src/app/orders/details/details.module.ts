import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '@ticketing/ng/env';
import { NgxStripeModule } from 'ngx-stripe';

import { PaymentModalComponent } from '../../payments/payment-modal.component';
import { OrderDetailsComponent } from './details.component';

@NgModule({
    declarations: [OrderDetailsComponent, PaymentModalComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgxStripeModule.forChild(environment.stripePublishableKey),
        RouterModule.forChild([{ path: '', component: OrderDetailsComponent }]),
    ]
})
export class DetailsModule {}
