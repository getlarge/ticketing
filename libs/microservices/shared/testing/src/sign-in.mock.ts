import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { JWTEnvironmentVariables } from '@ticketing/microservices/shared/env';
import { SESSION_ACCESS_TOKEN } from '@ticketing/shared/constants';
import { Types } from 'mongoose';
import * as sodium from 'sodium-native';

function genNonce(): Buffer {
  const buf = Buffer.allocUnsafe(sodium.crypto_secretbox_NONCEBYTES);
  sodium.randombytes_buf(buf);
  return buf;
}

export function createSigninSession(
  app: NestFastifyApplication,
  user: {
    email: string;
    id?: string;
  }
): string {
  const configService =
    app.get<ConfigService<JWTEnvironmentVariables>>(ConfigService);
  const jwtService = new JwtService({
    privateKey: configService.get('JWT_PRIVATE_KEY'),
    publicKey: configService.get('JWT_PUBLIC_KEY'),
    signOptions: {
      expiresIn: configService.get('JWT_EXPIRES_IN'),
      algorithm: configService.get('JWT_ALGORITHM'),
      issuer: configService.get('JWT_ISSUER'),
      audience: '',
    },
  });
  const payload = {
    username: user.email,
    sub: user.id || new Types.ObjectId().toHexString(),
  };
  const token = jwtService.sign(payload);
  const sessionKey = configService.get('SESSION_KEY');
  // mock fastify-secure-session
  const kObj = Symbol('object');
  const session = { [kObj]: {} };
  session[kObj][SESSION_ACCESS_TOKEN] = token;
  const nonce = genNonce();
  const msg = Buffer.from(JSON.stringify(session[kObj]));
  const cipher = Buffer.allocUnsafe(
    msg.length + sodium.crypto_secretbox_MACBYTES
  );
  sodium.crypto_secretbox_easy(cipher, msg, nonce, sessionKey);
  return cipher.toString('base64') + ';' + nonce.toString('base64');
}
