type GetTokenResponse = {
  entitled: boolean;
  token: string;
};

type EntitlementType = 'media' | 'playlist' | 'library';
