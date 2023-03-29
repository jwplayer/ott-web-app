import { array, boolean, mixed, number, object, SchemaOf, string, StringSchema } from 'yup';
import i18next from 'i18next';

import type { Cleeng, JWP, Config, Content, Features, Menu, Styling } from '#types/Config';

/**
 * Set config setup changes in both config.services.ts and config.d.ts
 * */

const contentSchema: SchemaOf<Content> = object({
  contentId: string().notRequired(),
  title: string().notRequired(),
  featured: boolean().notRequired(),
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

const jwpSchema: SchemaOf<JWP> = object({
  clientId: string().nullable(),
  assetId: number().nullable(),
  useSandbox: boolean().default(true),
});

const stylingSchema: SchemaOf<Styling> = object({
  backgroundColor: string().nullable(),
  highlightColor: string().nullable(),
  headerBackground: string().nullable(),
  footerText: string().nullable(),
});

const configSchema: SchemaOf<Config> = object({
  id: string().notRequired(),
  siteName: string().notRequired(),
  description: string().defined(),
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
    jwp: jwpSchema.notRequired(),
  }).notRequired(),
  custom: object().notRequired(),
  contentSigningService: object().shape({
    // see {@link https://github.com/jquense/yup/issues/1367}
    host: string().required() as StringSchema<string>,
    drmPolicyId: string().notRequired(),
  }),
  contentProtection: object()
    .shape({
      accessModel: string().oneOf(['free', 'freeauth', 'authvod', 'svod']).notRequired(),
      drm: object({
        defaultPolicyId: string(),
      }).notRequired(),
    })
    .notRequired(),
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
  const updatedContent = content.map((content) => Object.assign({ featured: false }, content));

  return { ...config, siteName: siteName || i18next.t('common:default_site_name'), content: updatedContent };
};

export const validateConfig = (config?: Config): Promise<Config> => {
  return configSchema.validate(config, {
    strict: true,
  }) as Promise<Config>;
};

export default loadConfig;
