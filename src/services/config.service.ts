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
});

const optionsSchema: SchemaOf<Options> = object({
  backgroundColor: string().notRequired(),
  highlightColor: string().notRequired(),
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
  footerText: string().defined(),
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

    return await response.json();
  } catch (error: unknown) {
    return error;
  }
};

export const validateConfig = (config: unknown): Promise<Config> => {
  return configSchema.validate(config, { strict: true }) as Promise<Config>;
};

export default loadConfig;
