import { array, boolean, mixed, number, object, SchemaOf, string, StringSchema } from 'yup';
import i18next from 'i18next';

import type { Cleeng, InPlayer, Config, Content, Features, Menu, Styling } from '#types/Config';

/**
 * Set config setup changes in both config.services.ts and config.d.ts
 * */

const contentSchema: SchemaOf<Content> = object({
  contentId: string().notRequired(),
  title: string().notRequired(),
  featured: boolean().notRequired(),
  enableText: boolean().notRequired(),
  backgroundColor: string().nullable().notRequired(),
  type: mixed().oneOf(['playlist', 'continue_watching', 'favorites']),
}).defined();

const menuSchema: SchemaOf<Menu> = object().shape({
  label: string().defined(),
  contentId: string().defined(),
  filterTags: string().notRequired(),
  type: mixed().oneOf(['playlist']).notRequired(),
});

const featuresSchema: SchemaOf<Features> = object({
  enableCasting: boolean().notRequired(),
  enableSharing: boolean().notRequired(),
  recommendationsPlaylist: string().nullable(),
  searchPlaylist: string().nullable(),
  continueWatchingList: string().nullable(),
  favoritesList: string().nullable(),
});

const cleengSchema: SchemaOf<Cleeng> = object({
  id: string().nullable(),
  monthlyOffer: string().nullable(),
  yearlyOffer: string().nullable(),
  useSandbox: boolean().default(true),
});

const inplayerSchema: SchemaOf<InPlayer> = object({
  clientId: string().nullable(),
  assetId: number().nullable(),
  useSandbox: boolean().default(true),
});

const stylingSchema: SchemaOf<Styling> = object({
  backgroundColor: string().nullable(),
  highlightColor: string().nullable(),
  headerBackground: string().nullable(),
  dynamicBlur: boolean().notRequired(),
  posterFading: boolean().notRequired(),
  shelfTitles: boolean().notRequired(),
  footerText: string().nullable(),
});

const configSchema: SchemaOf<Config> = object({
  id: string().notRequired(),
  siteName: string().notRequired(),
  description: string().defined(),
  player: string().defined(),
  analyticsToken: string().nullable(),
  adSchedule: string().nullable(),
  assets: object({
    banner: string().notRequired().nullable(),
  }).notRequired(),
  content: array().of(contentSchema),
  menu: array().of(menuSchema),
  styling: stylingSchema.notRequired(),
  features: featuresSchema.notRequired(),
  integrations: object({
    cleeng: cleengSchema.notRequired(),
    inplayer: inplayerSchema.notRequired(),
  }).notRequired(),
  custom: object().notRequired(),
  contentSigningService: object().shape({
    // see {@link https://github.com/jquense/yup/issues/1367}
    host: string().required() as StringSchema<string>,
    drmPolicyId: string().notRequired(),
  }),
}).defined();

const loadConfig = async (configLocation: string) => {
  if (!configLocation) {
    throw new Error('No config location found');
  }

  const response = await fetch(configLocation, {
    headers: {
      Accept: 'application/json',
    },
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to load the config. Please check the config path and the file availability.');
  }

  const data = await response.json();

  if (!data) {
    throw new Error('No config found');
  }

  return enrichConfig(data);
};

const enrichConfig = (config: Config): Config => {
  const { content, siteName } = config;
  const updatedContent = content.map((content) => Object.assign({ enableText: true, featured: false }, content));

  // TODO: Remove this once the inplayer integration structure is added to the dashboard
  if (!config.integrations.inplayer?.clientId && config.custom?.['inplayer.clientId']) {
    config.integrations.inplayer = {
      clientId: config.custom?.['inplayer.clientId'] as string,
      assetId: Number(config.custom?.['inplayer.assetId']),
      useSandbox: ['true', '1', 'yes'].indexOf((config.custom?.['inplayer.useSandbox'] as string)?.toLowerCase()) >= 0,
    };
  }

  return { ...config, siteName: siteName || i18next.t('common:default_site_name'), content: updatedContent };
};

export const validateConfig = (config?: Config): Promise<Config> => {
  return configSchema.validate(config, {
    strict: true,
  }) as Promise<Config>;
};

export default loadConfig;
