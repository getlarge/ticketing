import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ORDERS_STORE } from '../constants';
import { OrderStoreEffects } from './effects';
import { featureReducer } from './reducer';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(ORDERS_STORE, featureReducer),
    EffectsModule.forFeature([OrderStoreEffects]),
  ],
})
export class OrderStoreModule {}
