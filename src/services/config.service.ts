import type { Config, Content, Options, Menu } from 'types/Config';
import { string, boolean, array, object, SchemaOf } from 'yup';

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
  id: string().defined(),
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
  try {
    const response = await fetch(configLocation, {
      headers: {
        Accept: 'application/json',
      },
      method: 'GET',
    });

    const data = await response.json();

    if (data.version) {
      return parseDeprecatedConfig(data);
    }
    return data;
  } catch (error: unknown) {
    return error;
  }
};

/**
 * Serialize deprecated config to v3 config
 * @param {Object} config
 * @returns {jwOTTwebApp.config}
 */
const parseDeprecatedConfig = (config: Config) => {
  let newConfig;
  if (config.description.startsWith('{')) {
    try {
      const description = JSON.parse(config.description);
      config.description = '';

      newConfig = {
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

  return newConfig;
};

export const validateConfig = (config: Config): Promise<Config> => {
  return configSchema.validate(config, {
    strict: true,
  }) as Promise<Config>;
};

export default loadConfig;
