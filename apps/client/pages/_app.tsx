import 'bootstrap/dist/css/bootstrap.css';
import './styles.css';

import { Resources } from '@ticketing/shared/constants';
import { User } from '@ticketing/shared/models';
import { AxiosError } from 'axios';
import App, { AppContext } from 'next/app';
import Head from 'next/head';

import buildClient from '../api/build-client';
import Header from '../components/header/header';
import { CustomAppProps, GetInitialProps, InitialProps } from '../types/props';

function CustomApp({
  Component,
  pageProps,
  currentUser,
}: CustomAppProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Ticketing</title>
      </Head>
      <div className="app">
        <Header currentUser={currentUser} />
        <main className="container">
          <Component currentUser={currentUser} {...pageProps} />
        </main>
      </div>
    </>
  );
}

// Currently getServerSideProps is not working in Custom App
CustomApp.getInitialProps = async (appContext: AppContext) => {
  const appProps: InitialProps = await App.getInitialProps(appContext);
  const url = `/api/${Resources.USERS}/current-user`;
  const client = buildClient(appContext.ctx);
  try {
    const { data } = await client.get<User>(url);
    appProps.currentUser = data;
  } catch (err) {
    if ('isAxiosError' in err) {
      const error = err as AxiosError;
      console.error(error.response?.data || error.message);
    } else {
      console.error(err.message);
    }
    appProps.currentUser = null;
  }
  // let pageProps: Record<string, unknown>;
  if (typeof appContext.Component.getInitialProps === 'function') {
    const getInitialProps = appContext.Component
      .getInitialProps as GetInitialProps;

    appProps.pageProps = await getInitialProps(
      appContext.ctx,
      client,
      appProps.currentUser
    );
  }

  return appProps;
};

export default CustomApp;
