import type { AxiosRequestConfig } from 'axios';

export type InPlayerAuthData = {
  access_token: string;
  expires?: number;
};

export type InPlayerError = {
  response: {
    data: {
      code: number;
      message: string;
    };
  };
};

export type InPlayerResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  config: AxiosRequestConfig;
};
