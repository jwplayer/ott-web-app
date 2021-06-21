import type { Config, Content, Options, Menu } from 'types/Config';
import { string, boolean, array, object, SchemaOf } from 'yup';

import { PersonalShelf } from '../enum/PersonalShelf';

/**
 * Set config setup changes in both config.services.ts and config.d.ts
 * */

const contentSchema: SchemaOf<Content> = object({
  playlistId: string().defined(),
  featured: boolean().notRequired(),
}).defined();

const menuSchema: SchemaOf<Menu> = object().shape({
  label: string().defined(),
  playlistId: string().defined(),
  filterTags: string().notRequired(),
});

const optionsSchema: SchemaOf<Options> = object({
  backgroundColor: string().nullable(),
  highlightColor: string().nullable(),
  enableContinueWatching: boolean().notRequired(),
  headerBackground: string().notRequired(),
  enableCasting: boolean().notRequired(),
  enableSharing: boolean().notRequired(),
  dynamicBlur: boolean().notRequired(),
  posterFading: boolean().notRequired(),
  shelveTitles: boolean().notRequired(),
});

const configSchema: SchemaOf<Config> = object({
  id: string().notRequired(),
  siteName: string().defined(),
  description: string().defined(),
  footerText: string().nullable(),
  player: string().defined(),
  recommendationsPlaylist: string().notRequired(),
  searchPlaylist: string().notRequired(),
  analyticsToken: string().notRequired(),
  adSchedule: string().notRequired(),
  assets: object({
    banner: string().notRequired(),
  }).defined(),
  content: array().of(contentSchema),
  menu: array().of(menuSchema),
  options: optionsSchema.notRequired(),
  genres: array().of(string()).notRequired(),
  json: object().notRequired(),
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

  addPersonalShelves(data);

  if (data.version) {
    return parseDeprecatedConfig(data);
  }

  return data;
};

/**
 * Add the personal shelves if not already defined: Favorites, ContinueWatching
 * @param {Config} data
 */
const addPersonalShelves = (data: Config) => {
  if (!data.content.some(({ playlistId }) => playlistId === PersonalShelf.Favorites)) {
    data.content.push({ playlistId: PersonalShelf.Favorites });
  }
  if (data.options.enableContinueWatching) {
    if (!data.content.some(({ playlistId }) => playlistId === PersonalShelf.ContinueWatching)) {
      data.content.splice(1, 0, { playlistId: PersonalShelf.ContinueWatching });
    }
  }
};

/**
 * Serialize deprecated config to v3 config
 * @param {Config} config
 * @returns {Config}
 */
const parseDeprecatedConfig = (config: Config) => {
  if (config.description.startsWith('{')) {
    try {
      const description = JSON.parse(config.description);
      config.description = '';

      return {
        ...config,
        id: 'ID_PLACE_HOLDER',
        menu: description.menu,
        analyticsToken: description.analyticsToken,
        options: {
          dynamicBlur: description.dynamicBlur,
          ...config.options,
        },
      };
    } catch (error: unknown) {
      throw new Error('Failed to JSON parse the `description` property');
    }
  }

  return config;
};

export const validateConfig = (config: Config): Promise<Config> => {
  return configSchema.validate(config, {
    strict: true,
  }) as Promise<Config>;
};

export default loadConfig;
