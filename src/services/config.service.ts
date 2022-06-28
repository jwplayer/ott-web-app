import { string, boolean, array, object, SchemaOf, StringSchema, mixed } from 'yup';

import type { Config, Content, Menu, Styling, Features, Cleeng } from '#types/Config';
import { PersonalShelf } from '#src/enum/PersonalShelf';

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
  favoritesList: string().nullable(),
  continueWatchingList: string().nullable(),
});

const cleengSchema: SchemaOf<Cleeng> = object({
  id: string().nullable(),
  monthlyOffer: string().nullable(),
  yearlyOffer: string().nullable(),
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
  player: string().nullable(),
  analyticsToken: string().nullable(),
  adSchedule: string().nullable(),
  assets: object({
    banner: string().notRequired(),
  }).defined(),
  content: array().of(contentSchema),
  menu: array().of(menuSchema),
  styling: stylingSchema.notRequired(),
  features: featuresSchema.notRequired(),
  integrations: object({
    cleeng: cleengSchema.notRequired(),
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
    return null;
  }

  const response = await fetch(configLocation, {
    headers: {
      Accept: 'application/json',
    },
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to load the config');
  }

  const data = await response.json();

  enrichConfig(data);

  return data;
};

/**
 * Add content default options
 * @param {Config} data
 */
const enrichConfig = (data: Config) => {
  if (!data.content.some(({ type }) => type === PersonalShelf.Favorites)) {
    data.content.push({ type: PersonalShelf.Favorites });
  }

  data.content = data.content.map((content) => Object.assign({ enableText: true, featured: false }, content));
  data.siteName = data.siteName || 'My OTT Application';
};

export const validateConfig = (config: Config): Promise<Config> => {
  return configSchema.validate(config, {
    strict: true,
  }) as Promise<Config>;
};

export default loadConfig;
