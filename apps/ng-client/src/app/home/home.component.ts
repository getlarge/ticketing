import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { User } from '@ticketing/shared/models';
import { Observable } from 'rxjs';

import { RootState } from '../store/root-state';
import { UserStoreSelectors } from '../store/user-store';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
  user$!: Observable<User | null>;

  constructor(private store: Store<RootState>) {
    this.user$ = this.store.select(UserStoreSelectors.selectCurrentUser);
  }
}
