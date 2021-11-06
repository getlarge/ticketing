import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateUser } from './models/create-user';
import { User, UserModel } from './schemas/user.schema';

@Injectable()
export class UsersService {
  readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: UserModel) {}

  getCurrentUser() {
    return {};
  }

  signUp(user: CreateUser) {
    // this.userModel.b
    return {};
  }

  signIn(user: CreateUser) {
    return {};
  }

  signOut() {
    return {};
  }
}
