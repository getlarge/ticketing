import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '@ticketing/ng/open-api';
import { User, UserCredentials } from '@ticketing/shared/models';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LocalStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;
  private tokenSubject: BehaviorSubject<string>;
  public token: Observable<string | null>;

  constructor(
    private router: Router,
    private userService: UsersService,
    private localStorageService: LocalStorageService
  ) {
    this.userSubject = new BehaviorSubject(
      this.localStorageService.getObject('user')
    );
    this.user = this.userSubject.asObservable();
    this.tokenSubject = new BehaviorSubject(
      this.localStorageService.get('token')
    );
    this.token = this.tokenSubject.asObservable();
  }

  public get userValue(): User | null {
    return this.userSubject.value;
  }

  public get tokenValue(): string | null {
    return this.tokenSubject.value;
  }

  login(email: string, password: string): Observable<string> {
    return this.userService
      .usersControllerSignIn({ body: { email, password } })
      .pipe(
        map((res) => {
          const token = res.token as string;
          this.localStorageService.set('token', token);
          this.tokenSubject.next(token);
          return token;
        })
      );
  }

  getCurrentUser(): Observable<User> {
    return this.userService.usersControllerGetCurrentUser().pipe(
      map((user) => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        this.localStorageService.setObject('user', user);
        this.userSubject.next(user);
        return user;
      })
    );
  }

  logout(): Observable<void> {
    return this.userService.usersControllerSignOut().pipe(
      map(() => {
        // remove user from local storage and set current user to null
        this.localStorageService.remove('user');
        this.localStorageService.remove('token');
        this.userSubject.next(null);
        this.tokenSubject.next('');
        this.router.navigate(['user/sign-in']);
      })
    );
  }

  register(body: UserCredentials): Observable<User> {
    return this.userService.usersControllerSignUp({ body });
  }
}
