import './sign-in.module.css';

import { Resources } from '@ticketing/shared/constants';
import { UserCredentials } from '@ticketing/shared/models';
import Router from 'next/router';
import { FormEvent, useState } from 'react';

import { useRequest } from '../../hooks/use-request';

/* eslint-disable-next-line */
export interface SignInProps {}

// TODO: refactor SignIn and SignUp in a reusable component
export function SignIn(props: SignInProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest, errors } = useRequest({
    url: `/api/${Resources.USERS}/sign-in`,
    method: 'post',
    body: { email, password } as UserCredentials,
    onSuccess() {
      Router.push('/');
    },
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    await doRequest();
  }

  return (
    <form onSubmit={onSubmit}>
      <h1> Signin</h1>
      <div className="form-group">
        <label>Email addres</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        ></input>
      </div>
      <div className="form-group">
        <label>Passowrd</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="form-control"
        ></input>
      </div>
      {errors}
      <button className="btn btn-primary">Sign in</button>
    </form>
  );
}

export default SignIn;
