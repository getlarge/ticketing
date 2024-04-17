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

import { ClientDto } from '../models/client-dto';
import { CreateClientDto } from '../models/create-client-dto';
import { OryOAuth2WebhookPayloadDto } from '../models/ory-o-auth-2-webhook-payload-dto';
import { OryOAuth2WebhookResponseDto } from '../models/ory-o-auth-2-webhook-response-dto';

@Injectable({
  providedIn: 'root',
})
export class ClientsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /**
   * Path part for operation clientsControllerCreate
   */
  static readonly ClientsControllerCreatePath = '/api/clients';

  /**
   * Register a new client - Scope : clients:create_one.
   *
   * Register a new client
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `clientsControllerCreate()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  clientsControllerCreate$Response(params: {
    body: CreateClientDto;
  }): Observable<StrictHttpResponse<ClientDto>> {
    const rb = new RequestBuilder(
      this.rootUrl,
      ClientsService.ClientsControllerCreatePath,
      'post',
    );
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http
      .request(
        rb.build({
          responseType: 'json',
          accept: 'application/json',
        }),
      )
      .pipe(
        filter((r: any) => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => {
          return r as StrictHttpResponse<ClientDto>;
        }),
      );
  }

  /**
   * Register a new client - Scope : clients:create_one.
   *
   * Register a new client
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `clientsControllerCreate$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  clientsControllerCreate(params: {
    body: CreateClientDto;
  }): Observable<ClientDto> {
    return this.clientsControllerCreate$Response(params).pipe(
      map((r: StrictHttpResponse<ClientDto>) => r.body as ClientDto),
    );
  }

  /**
   * Path part for operation clientsControllerOnSignUp
   */
  static readonly ClientsControllerOnSignUpPath =
    '/api/clients/on-token-request';

  /**
   * Triggered when a client request an OAuth2 token
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `clientsControllerOnSignUp()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  clientsControllerOnSignUp$Response(params: {
    body: OryOAuth2WebhookPayloadDto;
  }): Observable<StrictHttpResponse<OryOAuth2WebhookResponseDto>> {
    const rb = new RequestBuilder(
      this.rootUrl,
      ClientsService.ClientsControllerOnSignUpPath,
      'post',
    );
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http
      .request(
        rb.build({
          responseType: 'json',
          accept: 'application/json',
        }),
      )
      .pipe(
        filter((r: any) => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => {
          return r as StrictHttpResponse<OryOAuth2WebhookResponseDto>;
        }),
      );
  }

  /**
   * Triggered when a client request an OAuth2 token
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `clientsControllerOnSignUp$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  clientsControllerOnSignUp(params: {
    body: OryOAuth2WebhookPayloadDto;
  }): Observable<OryOAuth2WebhookResponseDto> {
    return this.clientsControllerOnSignUp$Response(params).pipe(
      map(
        (r: StrictHttpResponse<OryOAuth2WebhookResponseDto>) =>
          r.body as OryOAuth2WebhookResponseDto,
      ),
    );
  }

  /**
   * Path part for operation clientsControllerGetCurrentClient
   */
  static readonly ClientsControllerGetCurrentClientPath =
    '/api/clients/current-client';

  /**
   * Get current client - Scope : clients:read_one.
   *
   * Get details about currently authenticated client
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `clientsControllerGetCurrentClient()` instead.
   *
   * This method doesn't expect any request body.
   */
  clientsControllerGetCurrentClient$Response(params?: {}): Observable<
    StrictHttpResponse<ClientDto>
  > {
    const rb = new RequestBuilder(
      this.rootUrl,
      ClientsService.ClientsControllerGetCurrentClientPath,
      'get',
    );
    if (params) {
    }

    return this.http
      .request(
        rb.build({
          responseType: 'json',
          accept: 'application/json',
        }),
      )
      .pipe(
        filter((r: any) => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => {
          return r as StrictHttpResponse<ClientDto>;
        }),
      );
  }

  /**
   * Get current client - Scope : clients:read_one.
   *
   * Get details about currently authenticated client
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `clientsControllerGetCurrentClient$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  clientsControllerGetCurrentClient(params?: {}): Observable<ClientDto> {
    return this.clientsControllerGetCurrentClient$Response(params).pipe(
      map((r: StrictHttpResponse<ClientDto>) => r.body as ClientDto),
    );
  }
}
