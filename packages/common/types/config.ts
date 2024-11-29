import type { APP_CONFIG_ITEM_TYPE } from '../src/constants';

import type { AdScheduleUrls, AdDeliveryMethod } from './ad-schedule';

/**
 * Set config setup changes in both config.services.ts and config.d.ts
 * */
export type Config = {
  id?: string;
  siteName?: string;
  description: string;
  analyticsToken?: string | null;
  adConfig?: string | null;
  adSchedule?: string | null;
  adScheduleUrls?: AdScheduleUrls;
  adDeliveryMethod?: AdDeliveryMethod;
  integrations: {
    cleeng?: Cleeng;
    jwp?: JWP;
  };
  assets: { banner?: string | null };
  content: Content[];
  menu: Menu[];
  styling?: Styling | null;
  features?: Features | null;
  custom?: Record<string, unknown> | null;
  contentSigningService?: ContentSigningConfig;
  contentProtection?: ContentProtection;
  siteId: string;
};

export type ContentSigningConfig = {
  host: string;
  drmPolicyId?: string;
};

export type ContentProtection = {
  accessModel: 'free' | 'freeauth' | 'authvod' | 'svod';
  drm?: Drm;
};

export type Drm = {
  defaultPolicyId: string;
};

export type AppContentType = keyof typeof APP_CONFIG_ITEM_TYPE;
export type AppMenuType = Extract<AppContentType, 'playlist' | 'content_list' | 'media'>;
export type AppShelfType = Extract<AppContentType, 'playlist' | 'content_list' | 'continue_watching' | 'favorites'>;

export type Content = {
  contentId?: string;
  title?: string;
  type: AppShelfType;
  /**
   * @deprecated Use the custom shelf property `layoutType = 'hero' | 'featured' | undefined` instead
   */
  featured?: boolean;
  backgroundColor?: string | null;
  custom?: Record<string, string>;
};

export type Menu = {
  label: string;
  contentId: string;
  type?: AppMenuType;
  filterTags?: string;
  custom?: Record<string, string>;
};

export type Styling = {
  backgroundColor?: string | null;
  highlightColor?: string | null;
  headerBackground?: string | null;
  /**
   * @deprecated the footerText is present in the config, but can't be updated in the JWP Dashboard
   */
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

export type IntegrationType = 'JWP' | 'CLEENG';
