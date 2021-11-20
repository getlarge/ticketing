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
import { User } from '@ticketing/shared/models';
import { Model } from 'mongoose';

import { Password } from '../shared/password';
import { UserCredentials, UserResponse } from './models';
import { User as UserSchema, UserDocument } from './schemas';

@Injectable()
export class UsersService {
  readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(UserSchema.name) private userModel: Model<UserDocument>,
    @Inject(JwtService) private jwtService: JwtService
  ) {}

  async signUp(user: UserCredentials): Promise<UserResponse> {
    const existingUser = await this.userModel.findOne({ email: user.email });
    if (existingUser) {
      throw new HttpException('email already used', HttpStatus.BAD_REQUEST);
    }
    const newUser = await this.userModel.create(user);
    return newUser.toJSON<UserResponse>();
  }

  async validateUser(email: string, password: string): Promise<UserResponse> {
    const existingUser = await this.userModel.findOne({ email });
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

  signOut(): Record<string, unknown> {
    return {};
  }
}
