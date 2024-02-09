import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserCredentials } from './models';
import { OnOrySignInDto, OnOrySignUpDto } from './models/ory-identity.dto';
import { User as UserSchema, UserDocument } from './schemas';

@Injectable()
export class UsersService {
  readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(UserSchema.name) private userModel: Model<UserDocument>,
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
   * @todo: throw error in format supported by Ory hooks response handler + create specific error class
   * @see https://www.ory.sh/docs/guides/integrate-with-ory-cloud-through-webhooks#flow-interrupting-webhooks
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
    // logic from original require_verified_address hook https://github.com/ory/kratos/blob/34751a1a3ad9b217af2de7b435b9ee70df510265/selfservice/hook/address_verifier.go
    if (!identity.verifiable_addresses?.length) {
      throw new HttpException(
        'A misconfiguration prevents login. Expected to find a verification address but this identity does not have one assigned.',
        HttpStatus.NOT_FOUND,
      );
    }
    const hasAddressVerified = identity.verifiable_addresses.some(
      (address) => address.verified,
    );
    if (!hasAddressVerified) {
      throw new HttpException('Email not verified', HttpStatus.UNAUTHORIZED);
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
