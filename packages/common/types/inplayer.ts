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
