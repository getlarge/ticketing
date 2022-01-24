import type { User } from '@ticketing/shared/models';
import type { AxiosInstance } from 'axios';
import type { NextPageContext } from 'next';
import type { AppInitialProps, AppProps } from 'next/app';

export interface InitialProps extends AppInitialProps {
  currentUser?: User;
}

export interface CustomAppProps extends AppProps {
  currentUser?: User;
}

export type GetInitialProps = <T = Record<string, unknown>>(
  context: NextPageContext,
  client: AxiosInstance,
  currentUser?: User
) => T | Promise<T>;
