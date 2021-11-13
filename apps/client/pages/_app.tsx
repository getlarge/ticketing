import 'bootstrap/dist/css/bootstrap.css';
import './styles.css';

import { Resources } from '@ticketing/shared/constants';
import { UserResponse } from '@ticketing/shared/models';
import { AxiosError } from 'axios';
import App, { AppContext, AppProps } from 'next/app';
import Head from 'next/head';

import buildClient from '../api/build-client';
import Header from '../components/header/header';

function CustomApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Ticketing</title>
      </Head>
      <div className="app">
        <Header {...pageProps} />
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
}

// Currently getServerSideProps is not working in Custom App
CustomApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  let pageProps: Record<string, unknown>;
  if (typeof appContext.Component.getInitialProps === 'function') {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }
  try {
    const url = `/api/${Resources.USERS}/current-user`;
    const { data } = await buildClient(appContext.ctx).get<UserResponse>(url);
    appProps.pageProps = { ...pageProps, currentUser: data };
    return appProps;
  } catch (err) {
    if ('isAxiosError' in err) {
      const error = err as AxiosError;
      console.error(error.response?.data || error.message);
    } else {
      console.error(err.message);
    }
    appProps.pageProps = { ...pageProps, currentUser: null };
    return appProps;
  }
};

export default CustomApp;
