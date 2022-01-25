import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AlertService } from '@ticketing/ng/alert';
import { Resources } from '@ticketing/shared/constants';
import { User } from '@ticketing/shared/models';
import { Observable, Subject, takeUntil } from 'rxjs';

import {
  RootStoreSelectors,
  UserStoreActions,
  UserStoreSelectors,
} from './store';
import { RootState } from './store/root-state';

@Component({
  selector: 'ticketing-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ng-client';
  error$!: Observable<string>;
  isLoading$!: Observable<boolean>;
  user$!: Observable<User | null>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  Resources = Resources;

  constructor(
    private store: Store<RootState>,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.alertService.clear();
    this.error$ = this.store.select(RootStoreSelectors.selectError);
    this.isLoading$ = this.store.select(RootStoreSelectors.selectIsLoading);
    this.user$ = this.store.select(UserStoreSelectors.selectCurrentUser);
    // TODO: only dispatch LoadCurrentUserAction if !!currentToken
    this.store.dispatch(new UserStoreActions.LoadCurrentUserAction());
    // TODO: find better place to load tickets and orders
    // TODO: requests get triggered many time after login why ?
    // this.store.dispatch(new TicketStoreActions.LoadTicketsAction());
    // this.store.dispatch(new OrderStoreActions.LoadOrdersAction());
    this.error$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (error) => {
        this.alertService.error(error, { autoClose: true });
      },
    });
  }

  ngOnDestroy(): void {
    this.alertService.clear();
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  logout(): void {
    this.store.dispatch(new UserStoreActions.SignOutAction());
    this.router.navigate(['/']);
  }
}
