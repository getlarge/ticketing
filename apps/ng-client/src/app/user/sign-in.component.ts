import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { filter, Observable, Subject, take, takeUntil } from 'rxjs';

import { UserStoreActions, UserStoreSelectors, UserStoreState } from '../store';

@Component({ templateUrl: 'sign-in.component.html' })
export class SignInComponent implements OnInit, OnDestroy {
  form!: UntypedFormGroup;
  isLoading$!: Observable<boolean>;
  submitted = false;
  returnUrl!: string;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<UserStoreState.State>,
    private actionsSubj: ActionsSubject
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.isLoading$ = this.store.select(UserStoreSelectors.selectUserIsLoading);
    // redirect to "returnUrl" if logged in and user loaded
    this.store
      .select(UserStoreSelectors.selectCurrentUser)
      .pipe(
        takeUntil(this.destroy$),
        filter((user) => !!user?.email)
      )
      .subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
        },
      });

    this.actionsSubj
      .pipe(
        takeUntil(this.destroy$),
        ofType<UserStoreActions.SignInSuccessAction>(
          UserStoreActions.ActionTypes.SIGN_IN_SUCCESS
        ),
        take(1)
      )
      .subscribe({
        next: () => {
          this.store.dispatch(new UserStoreActions.LoadCurrentUserAction());
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  // convenience getter for easy access to form fields
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.store.dispatch(
      new UserStoreActions.SignInAction({
        credentials: this.form.value,
      })
    );
  }
}
