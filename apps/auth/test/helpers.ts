import { NestFastifyApplication } from '@nestjs/platform-fastify';

export async function signUpAndLogin(
  app: NestFastifyApplication,
  payload: {
    email: string;
    password: string;
  }
): Promise<{ session: string }> {
  await app.inject({
    method: 'POST',
    url: '/users/sign-up',
    payload,
  });

  const signInResponse = await app.inject({
    method: 'POST',
    url: '/users/sign-in',
    payload,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { session: (signInResponse.cookies[0] as any).value };
}
