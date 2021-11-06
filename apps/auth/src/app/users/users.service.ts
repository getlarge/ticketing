import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
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

  async signUp(user: CreateUser): Promise<CreateUser> {
    const existingUser = await this.userModel.findOne({ email: user.email });
    if (existingUser) {
      throw new HttpException('Email already used', HttpStatus.BAD_REQUEST);
    }
    const newUser = this.userModel.build(user);
    const savedUser = await newUser.save();
    return savedUser.toJSON();
  }

  signIn(user: CreateUser) {
    return {};
  }

  signOut() {
    return {};
  }
}
