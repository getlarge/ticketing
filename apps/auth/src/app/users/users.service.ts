import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OryService } from '@ticketing/microservices/ory-client';
import { Model } from 'mongoose';

import { User, UserCredentials } from './models';
import { OnOrySignInDto, OnOrySignUpDto } from './models/ory-identity.dto';
import { User as UserSchema, UserDocument } from './schemas';

@Injectable()
export class UsersService {
  readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(UserSchema.name) private userModel: Model<UserDocument>,
    @Inject(OryService) private readonly oryService: OryService,
  ) {}

  /**
   * @description handle webhook payload sent after Ory registration and modify identity
   * Unfortunately Ory's promise is not totally fulfilled, when webhook is set to interrupt and the response is parsed, identity is not created yet (id set to 00000000-0000-0000-0000-000000000000)
   *
   * @see https://www.ory.sh/docs/guides/integrate-with-ory-cloud-through-webhooks#modify-identities
   **/
  async onSignUp(body: OnOrySignUpDto): Promise<OnOrySignUpDto> {
    this.logger.debug(`onSignUp`, body);
    const email = body.identity.traits.email;
    const existingUser = await this.userModel.findOne({
      email,
    });
    if (existingUser) {
      throw new HttpException('email already used', HttpStatus.BAD_REQUEST);
    }
    const result = await this.userModel.create({ email });
    const user = result.toJSON<User>();
    body.identity.metadata_public = { id: user.id };
    return { identity: body.identity };
  }

  /**
   * @description To workaround the issue with Ory's not offering transactional hooks, we need to check if the user exists in our database
   * if not we use it as a second chance to create it
   **/
  async onSignIn(body: OnOrySignInDto): Promise<OnOrySignInDto> {
    const { identity } = body;
    this.logger.debug(`onSignIn`, body);
    const email = identity.traits.email;
    const userId = (identity.metadata_public as { id: string }).id;
    const user = await this.userModel.findOne({
      id: userId,
      email,
    });
    if (!user) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }
    if (!user.identityId || user.identityId !== identity.id) {
      user.set({ identityId: identity.id });
      await user.save();
    }
    return { identity };
  }

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
}
