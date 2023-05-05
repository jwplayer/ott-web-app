import type { PurchaseHistoryCollection } from '@inplayer-org/inplayer.js';

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
  data: Record<T>;
  status: number;
  statusText: string;
  config: AxiosRequestConfig;
};
