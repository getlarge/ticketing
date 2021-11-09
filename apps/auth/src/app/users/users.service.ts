import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { Password } from '../shared/password';
import { UserCredentials } from './models/user-credentials';
import { User, UserModel } from './schemas/user.schema';

@Injectable()
export class UsersService {
  readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: UserModel,
    @Inject(JwtService) private jwtService: JwtService
  ) {}

  async signUp(user: UserCredentials): Promise<UserCredentials> {
    const existingUser = await this.userModel.findOne({ email: user.email });
    if (existingUser) {
      throw new HttpException('Email already used', HttpStatus.BAD_REQUEST);
    }
    const newUser = await this.userModel.create(user);
    return newUser.toJSON();
  }

  async validateUser(
    email: string,
    password: string
  ): Promise<{ id: string; email: string }> {
    const existingUser = await this.userModel.findOne({ email }, {});
    if (!existingUser) {
      throw new UnauthorizedException();
    }
    await this.validatePassword(existingUser.password, password);
    return { id: existingUser.id, email };
  }

  async validatePassword(
    storedPassword: string,
    password: string
  ): Promise<void> {
    const isValid = await Password.compare(storedPassword, password).catch(
      () => {
        throw new UnauthorizedException();
      }
    );
    if (!isValid) {
      throw new UnauthorizedException();
    }
  }

  async signIn(user: User): Promise<{ token: string }> {
    const payload = { username: user.email, sub: user.id };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }

  signOut() {
    return {};
  }

  getCurrentUser() {
    return {};
  }
}
