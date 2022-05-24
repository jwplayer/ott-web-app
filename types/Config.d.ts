/**
 * Set config setup changes in both config.services.ts and config.d.ts
 * */

export type Config = {
  id?: string;
  siteName?: string;
  description: string;
  player?: string | null;
  analyticsToken?: string | null;
  adSchedule?: string | null;
  integrations: {
    cleeng?: Cleeng;
  };
  assets: { banner?: string };
  content: Content[];
  menu: Menu[];
  styling: Styling;
  features?: Features;
  custom?: Record<string, unknown>;
};

export type ContentType = 'playlist' | 'continue_watching' | 'favorites';

export type Content = {
  contentId?: string;
  title?: string;
  type: ContentType;
  featured?: boolean;
  enableText?: boolean;
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
  dynamicBlur?: boolean;
  posterFading?: boolean;
  shelfTitles?: boolean;
  footerText?: string | null;
};

export type Cleeng = {
  id?: string | null;
  monthlyOffer?: string | null;
  yearlyOffer?: string | null;
  useSandbox?: boolean;
};

export type Features = {
  enableCasting?: boolean;
  enableSharing?: boolean;
  recommendationsPlaylist?: string | null;
  searchPlaylist?: string | null;
  // TODO: https://github.com/jwplayer/ott-web-app/issues/43
  // continue_watching_list?: string | null;
  // favorites_list?: string | null;
};

export type AccessModel = 'AVOD' | 'AUTHVOD' | 'SVOD';
