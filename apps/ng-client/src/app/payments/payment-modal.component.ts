import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { AlertService } from '@ticketing/ng/alert';
import { Order, User } from '@ticketing/shared/models';
import { StripeCardComponent, StripeService } from 'ngx-stripe';
import { Observable, Subject, takeUntil, withLatestFrom } from 'rxjs';

import {
  OrderStoreActions,
  OrderStoreSelectors,
  RootStoreState,
  UserStoreSelectors,
} from '../store';

@Component({
  selector: 'ticketing-payment',
  templateUrl: 'payment-modal.component.html',
  styleUrls: ['payment-modal.component.css'],
})
export class PaymentModalComponent implements OnInit, OnDestroy {
  @ViewChild(StripeCardComponent) card!: StripeCardComponent;

  order$!: Observable<Order | undefined>;
  currentUser$!: Observable<User | null>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  name = '';

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: '300',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0',
        },
      },
    },
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'en',
  };

  constructor(
    private stripeService: StripeService,
    private store: Store<RootStoreState.RootState>,
    private activeModal: NgbActiveModal,
    private actionsSubj: ActionsSubject,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.store.select(UserStoreSelectors.selectCurrentUser);
    this.order$ = this.store.select(OrderStoreSelectors.selectCurrentOrder());

    this.actionsSubj
      .pipe(
        takeUntil(this.destroy$),
        ofType<OrderStoreActions.PayOrderSuccessAction>(
          OrderStoreActions.ActionTypes.PAY_ORDER_SUCCESS
        )
      )
      .subscribe({
        next: () => {
          this.alertService.success('Order paid', {
            keepAfterRouteChange: true,
            autoClose: true,
          });
          this.activeModal.close();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  cancel(): void {
    this.activeModal.close();
  }

  pay(): void {
    this.stripeService
      .createToken(this.card.element, {
        name: this.name,
        currency: 'eur',
      })
      .pipe(takeUntil(this.destroy$), withLatestFrom(this.order$))
      .subscribe(([result, order]) => {
        const { token, error } = result;
        if (token) {
          this.store.dispatch(
            new OrderStoreActions.PayOrderAction({
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              orderId: order!.id,
              token: token.id,
            })
          );
        } else if (error) {
          this.store.dispatch(
            new OrderStoreActions.PayOrderFailureAction({
              error: error.message || 'Failed to create payment with Stripe',
            })
          );
        }
        return { token, error, order };
      });
  }
}
