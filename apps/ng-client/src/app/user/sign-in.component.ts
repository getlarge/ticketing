import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { first, Observable, Subject, takeUntil } from 'rxjs';

import { RootStoreState, UserStoreActions, UserStoreSelectors } from '../store';

@Component({ templateUrl: 'sign-in.component.html' })
export class SignInComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isLoading$!: Observable<boolean>;
  submitted = false;
  returnUrl!: string;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private actionsSubj: ActionsSubject,
    private store: Store<RootStoreState.RootState>
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.isLoading$ = this.store.select(UserStoreSelectors.selectUserIsLoading);
    // redirect to home if already logged in
    this.store
      .select(UserStoreSelectors.selectCurrentUser)
      .pipe(takeUntil(this.destroy$), first())
      .subscribe({
        next: (user) => (user ? this.router.navigate(['/']) : null),
      });

    this.actionsSubj
      .pipe(
        takeUntil(this.destroy$),
        ofType(UserStoreActions.ActionTypes.SIGN_IN_SUCCESS)
      )
      .subscribe({
        next: () => {
          this.store.dispatch(new UserStoreActions.LoadCurrentUserAction());
          this.router.navigate([this.returnUrl]);
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
    // stop here if form is invalid
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
