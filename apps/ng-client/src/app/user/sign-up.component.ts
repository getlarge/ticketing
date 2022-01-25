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
import { AlertService } from '@ticketing/ng/alert';
import { first, Observable, Subject, takeUntil } from 'rxjs';

import { RootStoreState, UserStoreActions, UserStoreSelectors } from '../store';

@Component({ templateUrl: 'sign-up.component.html' })
export class SignUpComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  submitted = false;
  isLoading$!: Observable<boolean>;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private actionsSubj: ActionsSubject,
    private store: Store<RootStoreState.RootState>,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.isLoading$ = this.store.select(UserStoreSelectors.selectUserIsLoading);
    // redirect to home if already logged
    this.store
      .select(UserStoreSelectors.selectCurrentUser)
      .pipe(takeUntil(this.destroy$), first())
      .subscribe({
        next: (user) => {
          if (user) {
            this.router.navigate(['/']);
          }
        },
      });

    this.actionsSubj
      .pipe(
        takeUntil(this.destroy$),
        ofType(UserStoreActions.ActionTypes.SIGN_UP_SUCCESS)
      )
      .subscribe({
        next: () => {
          this.alertService.success('Registration successful', {
            keepAfterRouteChange: true,
            autoClose: true,
          });
          this.router.navigate(['../sign-in'], { relativeTo: this.route });
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
    this.alertService.clear();
    if (this.form.invalid) {
      return;
    }

    this.store.dispatch(
      new UserStoreActions.SignUpAction({
        credentials: this.form.value,
      })
    );
  }
}
