import type { Config, Content, Cols, Options, Menu } from 'types/Config';
import { string, number, boolean, array, object, SchemaOf } from 'yup';

const colsSchema: SchemaOf<Cols> = object({
  xs: number().integer().positive().notRequired(),
  sm: number().integer().positive().notRequired(),
  md: number().integer().positive().notRequired(),
  lg: number().integer().positive().notRequired(),
  xl: number().integer().positive().notRequired(),
});

const contentSchema: SchemaOf<Content> = object({
  playlistId: string().defined(),
  featured: boolean().notRequired(),
  enableText: boolean().notRequired(),
  aspectRatio: number().integer().positive().notRequired(),
  type: string().notRequired(),
  enableSeeAll: boolean().notRequired(),
  rows: number().integer().positive().notRequired(),
  cols: colsSchema.notRequired(),
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
  assets: object({
    banner: string().notRequired(),
  }).defined(),
  content: array().of(contentSchema),
  menu: array().of(menuSchema),
  options: optionsSchema.notRequired(),
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
