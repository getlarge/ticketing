import { Component } from '@angular/core';
import { User } from '@ticketing/shared/models';

import { UserStateService } from '../services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
  user: User | null;

  constructor(private userService: UserStateService) {
    this.user = this.userService.userValue;
  }
}
