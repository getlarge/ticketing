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

import { CreateTicketDto } from '../models/create-ticket-dto';
import { FilterDto } from '../models/filter-dto';
import { PaginatedDto } from '../models/paginated-dto';
import { ProjectionDto } from '../models/projection-dto';
import { SortDto } from '../models/sort-dto';
import { StartKeyDto } from '../models/start-key-dto';
import { TicketDto } from '../models/ticket-dto';
import { UpdateTicketDto } from '../models/update-ticket-dto';

@Injectable({
  providedIn: 'root',
})
export class TicketsService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation ticketsControllerFind
   */
  static readonly TicketsControllerFindPath = '/api/tickets';

  /**
   * Find tickets - Scope : tickets:read_many.
   *
   * Filter tickets
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ticketsControllerFind()` instead.
   *
   * This method doesn't expect any request body.
   */
  ticketsControllerFind$Response(params?: {
    start_key?: Array<StartKeyDto>;
    skip?: number;
    limit?: number;
    sort?: SortDto;
    filter?: Array<FilterDto>;
    projection?: Array<ProjectionDto>;
  }): Observable<StrictHttpResponse<PaginatedDto & {
'results'?: Array<TicketDto>;
}>> {

    const rb = new RequestBuilder(this.rootUrl, TicketsService.TicketsControllerFindPath, 'get');
    if (params) {
      rb.query('start_key', params.start_key, {"style":"deepObject","explode":true});
      rb.query('skip', params.skip, {});
      rb.query('limit', params.limit, {});
      rb.query('sort', params.sort, {"style":"deepObject","explode":false});
      rb.query('filter', params.filter, {"style":"deepObject","explode":true});
      rb.query('projection', params.projection, {"style":"deepObject","explode":true});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<PaginatedDto & {
        'results'?: Array<TicketDto>;
        }>;
      })
    );
  }

  /**
   * Find tickets - Scope : tickets:read_many.
   *
   * Filter tickets
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `ticketsControllerFind$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ticketsControllerFind(params?: {
    start_key?: Array<StartKeyDto>;
    skip?: number;
    limit?: number;
    sort?: SortDto;
    filter?: Array<FilterDto>;
    projection?: Array<ProjectionDto>;
  }): Observable<PaginatedDto & {
'results'?: Array<TicketDto>;
}> {

    return this.ticketsControllerFind$Response(params).pipe(
      map((r: StrictHttpResponse<PaginatedDto & {
'results'?: Array<TicketDto>;
}>) => r.body as PaginatedDto & {
'results'?: Array<TicketDto>;
})
    );
  }

  /**
   * Path part for operation ticketsControllerCreate
   */
  static readonly TicketsControllerCreatePath = '/api/tickets';

  /**
   * Create a ticket - Scope : tickets:create_one.
   *
   * Request creation of a ticket
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ticketsControllerCreate()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  ticketsControllerCreate$Response(params: {
    body: CreateTicketDto
  }): Observable<StrictHttpResponse<TicketDto>> {

    const rb = new RequestBuilder(this.rootUrl, TicketsService.TicketsControllerCreatePath, 'post');
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<TicketDto>;
      })
    );
  }

  /**
   * Create a ticket - Scope : tickets:create_one.
   *
   * Request creation of a ticket
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `ticketsControllerCreate$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  ticketsControllerCreate(params: {
    body: CreateTicketDto
  }): Observable<TicketDto> {

    return this.ticketsControllerCreate$Response(params).pipe(
      map((r: StrictHttpResponse<TicketDto>) => r.body as TicketDto)
    );
  }

  /**
   * Path part for operation ticketsControllerFindById
   */
  static readonly TicketsControllerFindByIdPath = '/api/tickets/{id}';

  /**
   * Find a ticket - Scope : tickets:read_one.
   *
   * Request a ticket by id
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ticketsControllerFindById()` instead.
   *
   * This method doesn't expect any request body.
   */
  ticketsControllerFindById$Response(params: {
    id: string;
  }): Observable<StrictHttpResponse<TicketDto>> {

    const rb = new RequestBuilder(this.rootUrl, TicketsService.TicketsControllerFindByIdPath, 'get');
    if (params) {
      rb.path('id', params.id, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<TicketDto>;
      })
    );
  }

  /**
   * Find a ticket - Scope : tickets:read_one.
   *
   * Request a ticket by id
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `ticketsControllerFindById$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ticketsControllerFindById(params: {
    id: string;
  }): Observable<TicketDto> {

    return this.ticketsControllerFindById$Response(params).pipe(
      map((r: StrictHttpResponse<TicketDto>) => r.body as TicketDto)
    );
  }

  /**
   * Path part for operation ticketsControllerUpdateById
   */
  static readonly TicketsControllerUpdateByIdPath = '/api/tickets/{id}';

  /**
   * Update a ticket - Scope : tickets:update_one.
   *
   * Update a ticket by id
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ticketsControllerUpdateById()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  ticketsControllerUpdateById$Response(params: {
    id: string;
    body: UpdateTicketDto
  }): Observable<StrictHttpResponse<TicketDto>> {

    const rb = new RequestBuilder(this.rootUrl, TicketsService.TicketsControllerUpdateByIdPath, 'put');
    if (params) {
      rb.path('id', params.id, {});
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<TicketDto>;
      })
    );
  }

  /**
   * Update a ticket - Scope : tickets:update_one.
   *
   * Update a ticket by id
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `ticketsControllerUpdateById$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  ticketsControllerUpdateById(params: {
    id: string;
    body: UpdateTicketDto
  }): Observable<TicketDto> {

    return this.ticketsControllerUpdateById$Response(params).pipe(
      map((r: StrictHttpResponse<TicketDto>) => r.body as TicketDto)
    );
  }

}
