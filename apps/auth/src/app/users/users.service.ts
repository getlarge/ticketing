import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OryService } from '@ticketing/microservices/ory-client';
import { transactionManager } from '@ticketing/microservices/shared/mongo';
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
   * Unfortunately Ory's promise is not totally fulfilled. It seems impossible to trigger a blocking hooks after user registration
   * This webhook is processed asynchronously so we need to make an API call to modify the identity
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
      await this.oryService.deleteIdentity(body.identity.id).catch((error) => {
        this.logger.error(error);
      });
      throw new HttpException('email already used', HttpStatus.BAD_REQUEST);
    }
    await using manager = await transactionManager(this.userModel);
    const { identity } = await manager.wrap(async () => {
      const doc: Omit<User, 'id'> = {
        identityId: identity.id,
        email,
      };
      const [user] = await this.userModel.create([doc], {
        session: manager.session,
      });
      const updatedIdentity = await this.oryService.updateIdentityMetadata(
        identity.id,
        { id: user.id },
      );
      return { user, identity: updatedIdentity };
    });
    return { identity };
  }

  /**
   * @description To workarround the issue with Ory's not offering transactional hooks, we need to check if the user exists in our database
   * if not we use it as a second chance to create it
   **/
  async onSignIn(body: OnOrySignInDto): Promise<OnOrySignInDto> {
    const { identity } = body;
    this.logger.debug(`onSignIn`, body);
    const email = identity.traits.email;
    const user = await this.userModel.findOne({
      email,
    });
    if (!user) {
      const newUser = await this.userModel.create({
        identityId: identity.id,
        email,
      });
      const updatedIdentity = await this.oryService.updateIdentityMetadata(
        identity.id,
        { id: newUser.id },
      );
      identity.metadata_public = updatedIdentity.metadata_public;
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
