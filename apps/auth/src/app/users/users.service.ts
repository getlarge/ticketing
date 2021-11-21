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
import { Model } from 'mongoose';

import { Password } from '../shared/password';
import { User, UserCredentials } from './models';
import { User as UserSchema, UserDocument } from './schemas';

@Injectable()
export class UsersService {
  readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(UserSchema.name) private userModel: Model<UserDocument>,
    @Inject(JwtService) private jwtService: JwtService
  ) {}

  async signUp(credentials: UserCredentials): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: credentials.email,
    });
    if (existingUser) {
      throw new HttpException('email already used', HttpStatus.BAD_REQUEST);
    }
    const newUser = await this.userModel.create(credentials);
    return newUser.toJSON<User>();
  }

  async validateUser(email: string, password: string): Promise<User> {
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

  async signIn(currentUser: User): Promise<{ token: string }> {
    const payload = { username: currentUser.email, sub: currentUser.id };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }

  signOut(): Record<string, unknown> {
    return {};
  }
}
