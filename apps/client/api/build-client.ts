import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios';
import { NextPageContext } from 'next';

function buildClient({ req }: NextPageContext): AxiosInstance {
  const headers =
    typeof window === 'undefined' ? (req.headers as AxiosRequestHeaders) : {};
  const baseURL = typeof window === 'undefined' ? process.env.SERVER_URL : '';
  return axios.create({
    baseURL,
    headers,
  });
}

export default buildClient;
