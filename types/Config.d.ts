/**
 * Set config setup changes in both config.services.ts and config.d.ts
 * */

export type Config = {
  id?: string;
  siteName: string;
  description: string;
  footerText?: string | null;
  player: string;
  recommendationsPlaylist?: string | null;
  searchPlaylist?: string | null;
  analyticsToken?: string | null;
  adSchedule?: string | null;
  cleengId?: string | null;
  cleengSandbox: boolean;
  assets: { banner?: string };
  content: Content[];
  menu: Menu[];
  options: Options;
  genres?: string[];
  json?: Record<string, unknown>;
  contentSigningService?: ContentSigningConfig;
};

export type ContentSigningConfig = {
  host: string;
  drmEnabled?: boolean;
  drmPolicyId?: string;
};

export type Simple = {
  id: string;
};

export type Content = {
  playlistId: string;
  featured?: boolean;
  enableText?: boolean;
};

export type Menu = {
  label: string;
  playlistId: string;
  filterTags?: string;
};

export type Options = {
  backgroundColor?: string | null;
  highlightColor?: string | null;
  enableContinueWatching?: boolean;
  headerBackground?: string;
  enableCasting?: boolean;
  enableSharing?: boolean;
  dynamicBlur?: boolean;
  posterFading?: boolean;
  shelfTitles?: boolean;
};

export type AccessModel = 'AVOD' | 'AUTHVOD' | 'SVOD';
