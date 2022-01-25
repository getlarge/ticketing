import { Injectable, OnDestroy } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { delay, map, Observable, Subject, takeUntil } from 'rxjs';

import { RootStoreState, UserStoreSelectors } from '../store';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private store: Store<RootStoreState.RootState>
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.store.select(UserStoreSelectors.selectCurrentUser).pipe(
      delay(100),
      takeUntil(this.destroy$),
      map((currentUser) => {
        if (currentUser?.email) {
          // authorised so return true
          return true;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/user/sign-in'], {
          queryParams: { returnUrl: state.url || '/' },
        });
        return false;
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
