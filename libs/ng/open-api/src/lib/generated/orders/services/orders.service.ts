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

import { CreateOrderDto } from '../models/create-order-dto';
import { OrderDto } from '../models/order-dto';

@Injectable({
  providedIn: 'root',
})
export class OrdersService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation ordersControllerFind
   */
  static readonly OrdersControllerFindPath = '/api/orders';

  /**
   * Find orders - Scope : orders:read_many.
   *
   * Request user orders
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersControllerFind()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersControllerFind$Response(params?: {
  }): Observable<StrictHttpResponse<Array<OrderDto>>> {

    const rb = new RequestBuilder(this.rootUrl, OrdersService.OrdersControllerFindPath, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<OrderDto>>;
      })
    );
  }

  /**
   * Find orders - Scope : orders:read_many.
   *
   * Request user orders
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `ordersControllerFind$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersControllerFind(params?: {
  }): Observable<Array<OrderDto>> {

    return this.ordersControllerFind$Response(params).pipe(
      map((r: StrictHttpResponse<Array<OrderDto>>) => r.body as Array<OrderDto>)
    );
  }

  /**
   * Path part for operation ordersControllerCreate
   */
  static readonly OrdersControllerCreatePath = '/api/orders';

  /**
   * Create an order - Scope : orders:create_one.
   *
   * Request creation of an order
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersControllerCreate()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  ordersControllerCreate$Response(params: {
    body: CreateOrderDto
  }): Observable<StrictHttpResponse<OrderDto>> {

    const rb = new RequestBuilder(this.rootUrl, OrdersService.OrdersControllerCreatePath, 'post');
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<OrderDto>;
      })
    );
  }

  /**
   * Create an order - Scope : orders:create_one.
   *
   * Request creation of an order
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `ordersControllerCreate$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  ordersControllerCreate(params: {
    body: CreateOrderDto
  }): Observable<OrderDto> {

    return this.ordersControllerCreate$Response(params).pipe(
      map((r: StrictHttpResponse<OrderDto>) => r.body as OrderDto)
    );
  }

  /**
   * Path part for operation ordersControllerFindById
   */
  static readonly OrdersControllerFindByIdPath = '/api/orders/{id}';

  /**
   * Find an order - Scope : orders:read_one.
   *
   * Request an order by id
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersControllerFindById()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersControllerFindById$Response(params: {
    id: string;
  }): Observable<StrictHttpResponse<OrderDto>> {

    const rb = new RequestBuilder(this.rootUrl, OrdersService.OrdersControllerFindByIdPath, 'get');
    if (params) {
      rb.path('id', params.id, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<OrderDto>;
      })
    );
  }

  /**
   * Find an order - Scope : orders:read_one.
   *
   * Request an order by id
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `ordersControllerFindById$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersControllerFindById(params: {
    id: string;
  }): Observable<OrderDto> {

    return this.ordersControllerFindById$Response(params).pipe(
      map((r: StrictHttpResponse<OrderDto>) => r.body as OrderDto)
    );
  }

  /**
   * Path part for operation ordersControllerCancelById
   */
  static readonly OrdersControllerCancelByIdPath = '/api/orders/{id}';

  /**
   * Cancel an order - Scope : orders:delete_one.
   *
   * Cancel an order by id
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ordersControllerCancelById()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersControllerCancelById$Response(params: {
    id: string;
  }): Observable<StrictHttpResponse<OrderDto>> {

    const rb = new RequestBuilder(this.rootUrl, OrdersService.OrdersControllerCancelByIdPath, 'delete');
    if (params) {
      rb.path('id', params.id, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<OrderDto>;
      })
    );
  }

  /**
   * Cancel an order - Scope : orders:delete_one.
   *
   * Cancel an order by id
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `ordersControllerCancelById$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ordersControllerCancelById(params: {
    id: string;
  }): Observable<OrderDto> {

    return this.ordersControllerCancelById$Response(params).pipe(
      map((r: StrictHttpResponse<OrderDto>) => r.body as OrderDto)
    );
  }

}
