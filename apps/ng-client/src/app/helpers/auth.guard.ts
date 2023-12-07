import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { delay, map, Observable, Subject, takeUntil } from 'rxjs';

import { RootStoreState, UserStoreActions, UserStoreSelectors } from '../store';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store<RootStoreState.RootState>) {}

  canActivate(): Observable<boolean> {
    return this.store.select(UserStoreSelectors.selectCurrentUser).pipe(
      delay(100),
      takeUntil(this.destroy$),
      map((currentUser) => {
        if (currentUser?.email) {
          // authorised so return true
          return true;
        }
        // not logged in so redirect to Ory login page
        this.store.dispatch(new UserStoreActions.SignInAction());
        return false;
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
