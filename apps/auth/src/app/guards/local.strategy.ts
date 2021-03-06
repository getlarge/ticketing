import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@ticketing/microservices/shared/fastify-passport';
import { Strategy } from 'passport-local';

import { User } from '../users/models';
import { UsersService } from '../users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  validate(username: string, password: string): Promise<User> {
    return this.userService.validateUser(username, password);
  }
}
