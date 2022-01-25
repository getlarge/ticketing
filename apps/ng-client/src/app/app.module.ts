import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertModule } from '@ticketing/ng/alert';
import { environment } from '@ticketing/ng/env';
import {
  AddVersionHeaderInterceptor,
  AuthApiConfiguration,
  createApiBaseUrl,
  OrdersApiConfiguration,
  PaymentsApiConfiguration,
  TicketsApiConfiguration,
} from '@ticketing/ng/open-api';
import { Resources } from '@ticketing/shared/constants';
import { NgxStripeModule } from 'ngx-stripe';

import { AppComponent } from './app.component';
import { AuthGuard, ErrorInterceptor, JwtInterceptor } from './helpers';
import { HomeComponent } from './home';
import { RootStoreModule } from './store/root-store.module';

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgbModule,
    RootStoreModule,
    AlertModule,
    NgxStripeModule.forRoot(environment.stripePublishableKey),
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      {
        path: 'user',
        loadChildren: () =>
          import('./user/user.module').then((x) => x.UserModule),
      },
      {
        path: Resources.TICKETS,
        loadChildren: () =>
          import('./tickets/tickets.module').then((x) => x.TicketsModule),
        // TODO: make /tickets public
        canActivate: [AuthGuard],
      },
      {
        path: Resources.ORDERS,
        loadChildren: () =>
          import('./orders/orders.module').then((x) => x.OrdersModule),
        canActivate: [AuthGuard],
      },
      { path: '**', redirectTo: '' },
    ]),
  ],
  providers: [
    {
      provide: AuthApiConfiguration,
      useValue: { rootUrl: createApiBaseUrl(environment) },
    },
    {
      provide: OrdersApiConfiguration,
      useValue: { rootUrl: createApiBaseUrl(environment) },
    },
    {
      provide: PaymentsApiConfiguration,
      useValue: { rootUrl: createApiBaseUrl(environment) },
    },
    {
      provide: TicketsApiConfiguration,
      useValue: { rootUrl: createApiBaseUrl(environment) },
    },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: () => new AddVersionHeaderInterceptor(environment),
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
