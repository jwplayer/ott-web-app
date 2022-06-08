import { string, boolean, array, object, SchemaOf, StringSchema, mixed } from 'yup';

import type { Config, Content, Menu, Styling, Features, Cleeng } from '#types/Config';
import { PersonalShelf } from '#src/enum/PersonalShelf';

/**
 * Set config setup changes in both config.services.ts and config.d.ts
 * */

/**
 * We check here that we:
 * 1. Added favorites_list / continue_watching_list feature
 * 2. Included a corresponding element (with favorites or continue_watching type) in the content array
 */
const checkAdditionalFeatures = (content: Content[], playlistId: string | undefined | null, type: PersonalShelf) => {
  const hasAdditionalRowInContent = content.some((el) => el.type === type);

  if (playlistId && !hasAdditionalRowInContent) {
    throw new Error(`Please add an item with a '${type}' type to "content" array`);
  }

  if (!playlistId && hasAdditionalRowInContent) {
    throw new Error(`Please add an additional feature ${type === PersonalShelf.Favorites ? 'favorites_list' : 'continue_watching_list'}`);
  }

  return true;
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
  continue_watching_list: string().test('has-continue_watching-list-element', 'errorMessage', (value, context) => {
    // @ts-expect-error https://github.com/jquense/yup/issues/1631
    const { content, features } = context.from[1].value as Config;
    return checkAdditionalFeatures(content, value, PersonalShelf.ContinueWatching);
  }),
  favorites_list: string().test('has-continue_watching-list-element', 'errorMessage', (value, context) => {
    // @ts-expect-error https://github.com/jquense/yup/issues/1631
    const { content, features } = context.from[1].value as Config;
    return checkAdditionalFeatures(content, value, PersonalShelf.Favorites);
  }),
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

  return enrichConfig(data);
};

/**
 * Add default values to the config
 * @param {Config} data
 */
const enrichConfig = (config: Config): Config => {
  const { content, siteName } = config;
  const updatedContent = content.map((content) => Object.assign({ enableText: true, featured: false }, content));

  return { ...config, siteName: siteName || 'My OTT Application', content: updatedContent };
};

export const validateConfig = (config?: Config): Promise<Config> => {
  return configSchema.validate(config, {
    strict: true,
  }) as Promise<Config>;
};

export default loadConfig;
