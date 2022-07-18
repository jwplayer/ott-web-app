import { string, boolean, array, object, SchemaOf, StringSchema, mixed } from 'yup';

import type { Config, Content, Menu, Styling, Features, Cleeng } from '#types/Config';
import { PersonalShelf } from '#src/enum/PersonalShelf';
import i18n from '#src/i18n/config';
import { logDev } from '#src/utils/common';

/**
 * Set config setup changes in both config.services.ts and config.d.ts
 * */

/**
 * We check here that if we added a content item with favorites / continue_watching type,
 * then we also set up a corresponding playlistId (favoritesList / continueWatchingList)
 */
const checkContentItems = (config: Config) => {
  const { content, features } = config;

  [PersonalShelf.ContinueWatching, PersonalShelf.Favorites].forEach((type) => {
    const hasAdditionalRowInContent = content.some((el) => el.type === type);
    const isFavoritesRow = type === PersonalShelf.Favorites;
    const playlistId = isFavoritesRow ? features?.favoritesList : features?.continueWatchingList;

    if (!playlistId && hasAdditionalRowInContent) {
      logDev(
        `If you want to use a ${isFavoritesRow ? 'favorites' : 'continue_watching'} row please add a corresponding playlistId ${
          isFavoritesRow ? 'favoritesList' : 'continueWatchingList'
        } in a features section`,
      );
    }
  });
};

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
  }).notRequired(),
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
    throw new Error('No config location found');
  }

  const response = await fetch(configLocation, {
    headers: {
      Accept: 'application/json',
    },
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to load the config. Please check the config path and the file availability');
  }

  const data = await response.json();

  if (!data) {
    throw new Error('No config found');
  }

  checkContentItems(data);

  return enrichConfig(data);
};

/**
 * Add default values to the config
 * @param {Config} data
 */
const enrichConfig = (config: Config): Config => {
  const { content, siteName } = config;
  const updatedContent = content.map((content) => Object.assign({ enableText: true, featured: false }, content));

  return { ...config, siteName: siteName || i18n.t('common.default_site_name'), content: updatedContent };
};

export const validateConfig = (config?: Config): Promise<Config> => {
  return configSchema.validate(config, {
    strict: true,
  }) as Promise<Config>;
};

export default loadConfig;
