export type GetTokenResponse = {
  entitled: boolean;
  token: string;
};

export type EntitlementType = 'media' | 'playlist' | 'library';
