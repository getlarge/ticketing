/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CanActivate,
  ExecutionContext,
  Logger,
  mixin,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import passport from 'fastify-passport';

import { Type } from './interfaces';
import {
  AuthModuleOptions,
  IAuthModuleOptions,
} from './interfaces/auth-module.options';
import { defaultOptions } from './options';
import { memoize } from './utils/memoize.util';

export type IAuthGuard = CanActivate & {
  logIn(request: FastifyRequest): Promise<void>;
  getAuthenticateOptions(context: any): IAuthModuleOptions | undefined;
};

export const AuthGuard: (type?: string | string[]) => Type<IAuthGuard> =
  memoize(createAuthGuard);

const NO_STRATEGY_ERROR = `In order to use "defaultStrategy", please, ensure to import PassportModule in each place where AuthGuard() is being used. Otherwise, passport won't work correctly.`;

// eslint-disable-next-line max-lines-per-function
function createAuthGuard(type?: string | string[]): Type<CanActivate> {
  class MixinAuthGuard<TUser = any> implements CanActivate {
    constructor(@Optional() protected readonly options?: AuthModuleOptions) {
      this.options = this.options || {};
      if (!type && !this.options.defaultStrategy) {
        new Logger('AuthGuard').error(NO_STRATEGY_ERROR);
      }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const options = {
        ...defaultOptions,
        ...this.options,
        ...(await this.getAuthenticateOptions(context)),
      };
      const [request, response] = [
        this.getRequest(context),
        this.getResponse(context),
      ];
      await new Promise((resolve, reject) => {
        const handler = passport.authenticate(
          type,
          options,
          async function (
            _req: FastifyRequest,
            _res: FastifyReply,
            err: null | Error,
            user?: unknown,
            info?: unknown,
            status?: number
          ) {
            request.authInfo = info;
            if (err || !user) {
              reject(err || new UnauthorizedException());
            } else {
              const key =
                options.assignProperty || defaultOptions.assignProperty;
              request[key] = user;
              resolve(user);
            }
          }
        ) as any;
        handler(request, response);
      });

      return true;
    }

    getRequest(context: ExecutionContext): FastifyRequest {
      return context.switchToHttp().getRequest();
    }

    getResponse(context: ExecutionContext): FastifyReply {
      return context.switchToHttp().getResponse();
    }

    async logIn(request: FastifyRequest): Promise<void> {
      const options = {
        ...defaultOptions,
        ...this.options,
      };
      const user =
        request[this.options.assignProperty || defaultOptions.assignProperty];
      return await request.logIn(user, {
        session: options.session,
      });
    }

    getAuthenticateOptions(
      context: ExecutionContext
    ): Promise<IAuthModuleOptions> | IAuthModuleOptions | undefined {
      return undefined;
    }
  }
  const guard = mixin(MixinAuthGuard);
  return guard;
}
