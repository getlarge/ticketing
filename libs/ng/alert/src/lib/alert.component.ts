import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Alert, AlertType } from './alert.model';
import { AlertService } from './alert.service';

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'alert', templateUrl: 'alert.component.html' })
export class AlertComponent implements OnInit, OnDestroy {
  @Input() id = 'default-alert';
  @Input() fade = true;

  alerts: Alert[] = [];
  alertSubscription!: Subscription;
  routeSubscription!: Subscription;

  constructor(private router: Router, private alertService: AlertService) {}

  ngOnInit(): void {
    // subscribe to new alert notifications
    this.alertSubscription = this.alertService
      .onAlert(this.id)
      .subscribe((alert) => {
        // clear alerts when an empty alert is received
        if (!alert.message) {
          // filter out alerts without 'keepAfterRouteChange' flag
          this.alerts = this.alerts.filter((x) => x.keepAfterRouteChange);
          // remove 'keepAfterRouteChange' flag on the rest
          this.alerts.forEach((x) => delete x.keepAfterRouteChange);
          return;
        }

        this.alerts.push(alert);
        if (alert.autoClose) {
          setTimeout(() => this.removeAlert(alert), 3000);
        }
      });

    // clear alerts on location change
    this.routeSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.alertService.clear(this.id);
      }
    });
  }

  ngOnDestroy(): void {
    // unsubscribe to avoid memory leaks
    this.alertSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  removeAlert(alert: Alert): void {
    // check if already removed to prevent error on auto close
    if (!this.alerts.includes(alert)) return;

    if (this.fade) {
      // fade out alert
      const foundAlert = this.alerts.find((x) => x.id === alert.id);
      if (foundAlert?.fade) {
        foundAlert.fade = true;
      }

      // remove alert after faded out
      setTimeout(() => {
        this.alerts = this.alerts.filter((x) => x !== alert);
      }, 250);
    } else {
      // remove alert
      this.alerts = this.alerts.filter((x) => x !== alert);
    }
  }

  cssClass(alert?: Alert): string | undefined {
    if (!alert) return;
    const classes = ['alert', 'alert-dismissable', 'mt-4', 'container'];
    const alertTypeClass = {
      [AlertType.Success]: 'alert alert-success',
      [AlertType.Error]: 'alert alert-danger',
      [AlertType.Info]: 'alert alert-info',
      [AlertType.Warning]: 'alert alert-warning',
    };

    classes.push(alertTypeClass[alert.type]);

    if (alert.fade) {
      classes.push('fade');
    }

    return classes.join(' ');
  }
}
