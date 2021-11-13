import './sign-out.module.css';

import { Resources } from '@ticketing/shared/constants';
import Router from 'next/router';
import { useEffect } from 'react';

import { useRequest } from '../../hooks/use-request';

/* eslint-disable-next-line */
export interface SignOutProps {}

export function SignOut(props: SignOutProps): JSX.Element {
  const { doRequest } = useRequest({
    url: `/api/${Resources.USERS}/sign-out`,
    method: 'post',
    body: {},
    onSuccess() {
      Router.push('/');
    },
  });

  useEffect(() => {
    doRequest();
  });

  return <div>Signing out ...</div>;
}

export default SignOut;
