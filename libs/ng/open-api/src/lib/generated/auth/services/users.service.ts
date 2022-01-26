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

import { UserCredentialsDto } from '../models/user-credentials-dto';
import { UserDto } from '../models/user-dto';

@Injectable({
  providedIn: 'root',
})
export class UsersService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
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
    body: UserCredentialsDto
  }): Observable<StrictHttpResponse<UserDto>> {

    const rb = new RequestBuilder(this.rootUrl, UsersService.UsersControllerSignUpPath, 'post');
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
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
    body: UserCredentialsDto
  }): Observable<UserDto> {

    return this.usersControllerSignUp$Response(params).pipe(
      map((r: StrictHttpResponse<UserDto>) => r.body as UserDto)
    );
  }

  /**
   * Path part for operation usersControllerSignIn
   */
  static readonly UsersControllerSignInPath = '/api/users/sign-in';

  /**
   * Sign in - Scope : users:sign_in.
   *
   * Sign in as registered user
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `usersControllerSignIn()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  usersControllerSignIn$Response(params: {
    body: UserCredentialsDto
  }): Observable<StrictHttpResponse<{

/**
 * JWT token
 */
'token'?: string;
}>> {

    const rb = new RequestBuilder(this.rootUrl, UsersService.UsersControllerSignInPath, 'post');
    if (params) {
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<{
        
        /**
         * JWT token
         */
        'token'?: string;
        }>;
      })
    );
  }

  /**
   * Sign in - Scope : users:sign_in.
   *
   * Sign in as registered user
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `usersControllerSignIn$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  usersControllerSignIn(params: {
    body: UserCredentialsDto
  }): Observable<{

/**
 * JWT token
 */
'token'?: string;
}> {

    return this.usersControllerSignIn$Response(params).pipe(
      map((r: StrictHttpResponse<{

/**
 * JWT token
 */
'token'?: string;
}>) => r.body as {

/**
 * JWT token
 */
'token'?: string;
})
    );
  }

  /**
   * Path part for operation usersControllerSignOut
   */
  static readonly UsersControllerSignOutPath = '/api/users/sign-out';

  /**
   * Sign out - Scope : users:sign_out.
   *
   * Sign out as signed in user
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `usersControllerSignOut()` instead.
   *
   * This method doesn't expect any request body.
   */
  usersControllerSignOut$Response(params?: {
  }): Observable<StrictHttpResponse<{
'success'?: boolean;
}>> {

    const rb = new RequestBuilder(this.rootUrl, UsersService.UsersControllerSignOutPath, 'post');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<{
        'success'?: boolean;
        }>;
      })
    );
  }

  /**
   * Sign out - Scope : users:sign_out.
   *
   * Sign out as signed in user
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `usersControllerSignOut$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  usersControllerSignOut(params?: {
  }): Observable<{
'success'?: boolean;
}> {

    return this.usersControllerSignOut$Response(params).pipe(
      map((r: StrictHttpResponse<{
'success'?: boolean;
}>) => r.body as {
'success'?: boolean;
})
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
  usersControllerGetCurrentUser$Response(params?: {
  }): Observable<StrictHttpResponse<UserDto>> {

    const rb = new RequestBuilder(this.rootUrl, UsersService.UsersControllerGetCurrentUserPath, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
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
  usersControllerGetCurrentUser(params?: {
  }): Observable<UserDto> {

    return this.usersControllerGetCurrentUser$Response(params).pipe(
      map((r: StrictHttpResponse<UserDto>) => r.body as UserDto)
    );
  }

}
