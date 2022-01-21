import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, State, Store } from '@ngrx/store';
import { AlertService } from '@ticketing/ng/alert';
import { Observable, Subscription } from 'rxjs';

import { RootStoreState, UserStoreActions, UserStoreSelectors } from '../store';

@Component({ templateUrl: 'sign-in.component.html' })
export class SignInComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isLoading$!: Observable<boolean>;
  submitted = false;
  returnUrl!: string;
  signInSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private actionsSubj: ActionsSubject,
    private store: Store<RootStoreState.RootState>,
    private state: State<RootStoreState.RootState>,
    private alertService: AlertService
  ) {
    // redirect to home if already logged in
    if (
      (this.state.getValue() as RootStoreState.RootState)?.users?.currentUser
    ) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.isLoading$ = this.store.select(UserStoreSelectors.selectUserIsLoading);

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.signInSubscription = this.actionsSubj
      .pipe(ofType(UserStoreActions.ActionTypes.SIGN_IN_SUCCESS))
      .subscribe({
        next: () => {
          this.store.dispatch(new UserStoreActions.LoadCurrentUserAction());
          this.router.navigate([this.returnUrl]);
        },
      });
  }

  ngOnDestroy(): void {
    this.signInSubscription?.unsubscribe();
  }

  // convenience getter for easy access to form fields
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();
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
