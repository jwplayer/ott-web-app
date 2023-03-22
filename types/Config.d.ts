/**
 * Set config setup changes in both config.services.ts and config.d.ts
 * */

export type Config = {
  id?: string;
  siteName?: string;
  description: string;
  analyticsToken?: string | null;
  adSchedule?: string | null;
  integrations: {
    cleeng?: Cleeng;
    jwp?: JWP;
  };
  assets: { banner?: string | null };
  content: Content[];
  menu: Menu[];
  styling: Styling;
  features?: Features;
  custom?: Record<string, unknown>;
  contentSigningService?: ContentSigningConfig;
};

export type ContentSigningConfig = {
  host: string;
  drmPolicyId?: string;
};

export type ContentType = 'playlist' | 'continue_watching' | 'favorites';

export type Content = {
  contentId?: string;
  title?: string;
  type: ContentType;
  featured?: boolean;
  backgroundColor?: string | null;
};

export type Menu = {
  label: string;
  contentId: string;
  type?: Extract<ContentType, 'playlist'>;
  filterTags?: string;
};

export type Styling = {
  backgroundColor?: string | null;
  highlightColor?: string | null;
  headerBackground?: string | null;
  footerText?: string | null;
};

export type Cleeng = {
  id?: string | null;
  monthlyOffer?: string | null;
  yearlyOffer?: string | null;
  useSandbox?: boolean;
};
export type JWP = {
  clientId?: string | null;
  assetId?: number | null;
  useSandbox?: boolean;
};
export type Features = {
  recommendationsPlaylist?: string | null;
  searchPlaylist?: string | null;
  favoritesList?: string | null;
  continueWatchingList?: string | null;
};

/**
 * AVOD: Advert based
 * AUTHVOD: Authorisation based, needs registration
 * SVOD: Subscription based
 *
 * TVOD: Transactional based. This can only be set per item, so is not a valid accessModel value
 * */
export type AccessModel = 'AVOD' | 'AUTHVOD' | 'SVOD';
