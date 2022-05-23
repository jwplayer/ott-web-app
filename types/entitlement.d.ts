type EntitlementJwt = {
  resource: string;
  exp: number;
  iat: number;
};

type EntitlementResponse = {
  entitled: boolean;
  token: string;
};

type EntitlementType = 'media' | 'playlist' | 'library';
