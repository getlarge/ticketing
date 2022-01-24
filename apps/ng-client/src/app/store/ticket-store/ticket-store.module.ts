import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { TICKETS_STORE } from '../constants';
import { TicketStoreEffects } from './effects';
import { featureReducer } from './reducer';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(TICKETS_STORE, featureReducer),
    EffectsModule.forFeature([TicketStoreEffects])
  ]
})
export class TicketStoreModule {}
