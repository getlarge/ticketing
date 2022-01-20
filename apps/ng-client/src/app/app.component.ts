import { Component } from '@angular/core';
import { User } from '@ticketing/shared/models';

import { UserStateService } from './services';

@Component({
  selector: 'ticketing-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-client';

  user?: User | null;

  constructor(private userStateService: UserStateService) {
    this.userStateService.user.subscribe((x) => (this.user = x));
  }

  logout(): void {
    this.userStateService.logout();
  }
}
