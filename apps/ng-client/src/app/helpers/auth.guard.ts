import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { State } from '@ngrx/store';

import { RootStoreState } from '../store';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private state: State<RootStoreState.RootState>
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const currentState = this.state.getValue() as RootStoreState.RootState;
    if (currentState?.users?.currentUser?.email) {
      // authorised so return true
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/user/sign-in'], {
      queryParams: { returnUrl: state.url || '/' },
    });
    return false;
  }
}
