/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { CreatePaymentDto } from '../models/create-payment-dto';
import { PaymentDto } from '../models/payment-dto';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation paymentsControllerCreate
   */
  static readonly PaymentsControllerCreatePath = '/api/payments';

  /**
   * Create payment request - Scope : payments:create_one.
   *
   * Attempt to charge for a ticket order
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `paymentsControllerCreate()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  paymentsControllerCreate$Response(params: {
    body: CreatePaymentDto
  }): Observable<StrictHttpResponse<PaymentDto>> {

    const rb = new RequestBuilder(this.rootUrl, PaymentsService.PaymentsControllerCreatePath, 'post');
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<PaymentDto>;
      })
    );
  }

  /**
   * Create payment request - Scope : payments:create_one.
   *
   * Attempt to charge for a ticket order
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `paymentsControllerCreate$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  paymentsControllerCreate(params: {
    body: CreatePaymentDto
  }): Observable<PaymentDto> {

    return this.paymentsControllerCreate$Response(params).pipe(
      map((r: StrictHttpResponse<PaymentDto>) => r.body as PaymentDto)
    );
  }

}
