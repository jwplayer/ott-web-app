type GetTokenResponse = {
  entitled: boolean;
  token: string;
};

type GetPublicMediaTokensResponse = {
  media: { [key: string]: string };
};

type EntitlementType = 'media' | 'playlist' | 'library';
