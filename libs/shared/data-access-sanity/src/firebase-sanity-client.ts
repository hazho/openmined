import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NX_FIREBASE_FUNCTION_BASE_URL;

export default function (opts: AxiosRequestConfig) {
  return axios({
    ...opts,
    url: `${BASE_URL}/${opts.url}`,
  });
}
