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

import { OnOrySignInDto } from '../models/on-ory-sign-in-dto';
import { OnOrySignUpDto } from '../models/on-ory-sign-up-dto';
import { UserCredentialsDto } from '../models/user-credentials-dto';
import { UserDto } from '../models/user-dto';

@Injectable({
  providedIn: 'root',
})
export class UsersService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /**
   * Path part for operation usersControllerOnSignUp
   */
  static readonly UsersControllerOnSignUpPath = '/api/users/on-sign-up';

  /**
   * Register a user - Scope : users:create_one.
   *
   * Triggered when a user is created in Ory
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `usersControllerOnSignUp()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  usersControllerOnSignUp$Response(params: {
    body: OnOrySignUpDto;
  }): Observable<StrictHttpResponse<OnOrySignUpDto>> {
    const rb = new RequestBuilder(
      this.rootUrl,
      UsersService.UsersControllerOnSignUpPath,
      'post'
    );
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http
      .request(
        rb.build({
          responseType: 'json',
          accept: 'application/json',
        })
      )
      .pipe(
        filter((r: any) => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => {
          return r as StrictHttpResponse<OnOrySignUpDto>;
        })
      );
  }

  /**
   * Register a user - Scope : users:create_one.
   *
   * Triggered when a user is created in Ory
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `usersControllerOnSignUp$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  usersControllerOnSignUp(params: {
    body: OnOrySignUpDto;
  }): Observable<OnOrySignUpDto> {
    return this.usersControllerOnSignUp$Response(params).pipe(
      map((r: StrictHttpResponse<OnOrySignUpDto>) => r.body as OnOrySignUpDto)
    );
  }

  /**
   * Path part for operation usersControllerOnSignIn
   */
  static readonly UsersControllerOnSignInPath = '/api/users/on-sign-in';

  /**
   * Login a user - Scope : users:sign_in.
   *
   * Triggered when a user signed in via Ory
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `usersControllerOnSignIn()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  usersControllerOnSignIn$Response(params: {
    body: OnOrySignInDto;
  }): Observable<StrictHttpResponse<OnOrySignInDto>> {
    const rb = new RequestBuilder(
      this.rootUrl,
      UsersService.UsersControllerOnSignInPath,
      'post'
    );
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http
      .request(
        rb.build({
          responseType: 'json',
          accept: 'application/json',
        })
      )
      .pipe(
        filter((r: any) => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => {
          return r as StrictHttpResponse<OnOrySignInDto>;
        })
      );
  }

  /**
   * Login a user - Scope : users:sign_in.
   *
   * Triggered when a user signed in via Ory
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `usersControllerOnSignIn$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  usersControllerOnSignIn(params: {
    body: OnOrySignInDto;
  }): Observable<OnOrySignInDto> {
    return this.usersControllerOnSignIn$Response(params).pipe(
      map((r: StrictHttpResponse<OnOrySignInDto>) => r.body as OnOrySignInDto)
    );
  }

  /**
   * Path part for operation usersControllerSignUp
   */
  static readonly UsersControllerSignUpPath = '/api/users/sign-up';

  /**
   * Register a user - Scope : users:create_one.
   *
   * Request creation of a user
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `usersControllerSignUp()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  usersControllerSignUp$Response(params: {
    body: UserCredentialsDto;
  }): Observable<StrictHttpResponse<UserDto>> {
    const rb = new RequestBuilder(
      this.rootUrl,
      UsersService.UsersControllerSignUpPath,
      'post'
    );
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http
      .request(
        rb.build({
          responseType: 'json',
          accept: 'application/json',
        })
      )
      .pipe(
        filter((r: any) => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => {
          return r as StrictHttpResponse<UserDto>;
        })
      );
  }

  /**
   * Register a user - Scope : users:create_one.
   *
   * Request creation of a user
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `usersControllerSignUp$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  usersControllerSignUp(params: {
    body: UserCredentialsDto;
  }): Observable<UserDto> {
    return this.usersControllerSignUp$Response(params).pipe(
      map((r: StrictHttpResponse<UserDto>) => r.body as UserDto)
    );
  }

  /**
   * Path part for operation usersControllerGetCurrentUser
   */
  static readonly UsersControllerGetCurrentUserPath = '/api/users/current-user';

  /**
   * Get current user - Scope : users:read_one.
   *
   * Get details about currently signed in user
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `usersControllerGetCurrentUser()` instead.
   *
   * This method doesn't expect any request body.
   */
  usersControllerGetCurrentUser$Response(params?: {}): Observable<
    StrictHttpResponse<UserDto>
  > {
    const rb = new RequestBuilder(
      this.rootUrl,
      UsersService.UsersControllerGetCurrentUserPath,
      'get'
    );
    if (params) {
    }

    return this.http
      .request(
        rb.build({
          responseType: 'json',
          accept: 'application/json',
        })
      )
      .pipe(
        filter((r: any) => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => {
          return r as StrictHttpResponse<UserDto>;
        })
      );
  }

  /**
   * Get current user - Scope : users:read_one.
   *
   * Get details about currently signed in user
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `usersControllerGetCurrentUser$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  usersControllerGetCurrentUser(params?: {}): Observable<UserDto> {
    return this.usersControllerGetCurrentUser$Response(params).pipe(
      map((r: StrictHttpResponse<UserDto>) => r.body as UserDto)
    );
  }
}
