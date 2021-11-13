import './sign-up.module.css';

import { Resources } from '@ticketing/shared/constants';
import { UserCredentials } from '@ticketing/shared/models';
import Router from 'next/router';
import { FormEvent, useState } from 'react';

import { useRequest } from '../../hooks/use-request';

/* eslint-disable-next-line */
export interface SignUpProps {}

export function SignUp(props: SignUpProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest, errors } = useRequest({
    url: `/api/${Resources.USERS}/sign-up`,
    method: 'post',
    body: { email, password } as UserCredentials,
    onSuccess() {
      Router.push('/');
    },
  });

  // import useSWR from 'swr'
  // const { data, error } = useSWR('/api/user', doRequest)

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    await doRequest();
  }

  return (
    <form onSubmit={onSubmit}>
      <h1> Signup</h1>
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
      <button className="btn btn-primary">Sign up</button>
    </form>
  );
}

export default SignUp;
