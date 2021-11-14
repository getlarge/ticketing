import { FastifyRequest } from 'fastify';
import passport, { Authenticator } from 'fastify-passport';

export abstract class PassportSerializer {
  abstract serializeUser<User, StoredUser = any>(
    user: User,
    request: FastifyRequest
  ): Promise<StoredUser>;
  abstract deserializeUser<StoredUser>(
    stored: StoredUser,
    request: FastifyRequest
  ): Promise<StoredUser | false>;

  constructor() {
    const passportInstance = this.getPassportInstance();
    passportInstance.serializeUser = this.serializeUser;
    passportInstance.deserializeUser = this.deserializeUser;
  }

  getPassportInstance(): Authenticator {
    return passport;
  }
}
