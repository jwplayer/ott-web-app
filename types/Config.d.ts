export type Config = {
  id: string;
  siteName: string;
  description: string;
  footerText: string;
  player: string;
  recommendationsPlaylist?: string;
  searchPlaylist?: string;
  analyticsToken?: string;
  assets: { banner?: string };
  content: Content[];
  menu: Menu[];
  options: Options;
  json?: Record<string, unknown>;
};

export type Simple = {
  id: string;
};

export type Content = {
  playlistId: string;
  featured?: boolean;
  enableText?: boolean;
  aspectRatio?: number;
  type?: string;
  enableSeeAll?: boolean;
  rows?: number;
  cols?: Cols;
};

export type Menu = {
  label: string;
  playlistId: string;
};

export type Options = {
  backgroundColor?: string;
  highlightColor?: string;
  enableContinueWatching?: boolean;
  headerBackground?: string;
  enableCasting?: boolean;
  enableSharing?: boolean;
  dynamicBlur?: boolean;
  posterFading?: boolean;
  shelveTitles?: boolean;
};

export type Cols = {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};
