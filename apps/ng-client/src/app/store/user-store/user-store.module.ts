import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { USERS_STORE } from '../constants';
import { UserStoreEffects } from './effects';
import { featureReducer } from './reducer';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(USERS_STORE, featureReducer),
    EffectsModule.forFeature([UserStoreEffects]),
  ],
})
export class UserStoreModule {}
