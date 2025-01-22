export type JWError = {
  code: string;
  description: string;
};

export type JWErrorResponse = {
  errors: JWError[];
};
