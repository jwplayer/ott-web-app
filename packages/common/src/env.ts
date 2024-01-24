export type Env = {
  APP_VERSION: string;
  APP_API_BASE_URL: string;
  APP_PLAYER_ID: string;
  APP_FOOTER_TEXT: string;
  APP_DEFAULT_LANGUAGE: string;

  APP_DEFAULT_CONFIG_SOURCE?: string;
  APP_PLAYER_LICENSE_KEY?: string;

  APP_BODY_FONT?: string;
  APP_BODY_ALT_FONT?: string;
};

const env: Env = {
  APP_VERSION: '',
  APP_API_BASE_URL: 'https://cdn.jwplayer.com',
  APP_PLAYER_ID: 'M4qoGvUk',
  APP_FOOTER_TEXT: '',
  APP_DEFAULT_LANGUAGE: 'en',
};

export const configureEnv = (options: Partial<Env>) => {
  env.APP_VERSION = options.APP_VERSION || env.APP_VERSION;
  env.APP_API_BASE_URL = options.APP_API_BASE_URL || env.APP_API_BASE_URL;
  env.APP_PLAYER_ID = options.APP_PLAYER_ID || env.APP_PLAYER_ID;
  env.APP_FOOTER_TEXT = options.APP_FOOTER_TEXT || env.APP_FOOTER_TEXT;
  env.APP_DEFAULT_LANGUAGE = options.APP_DEFAULT_LANGUAGE || env.APP_DEFAULT_LANGUAGE;

  env.APP_DEFAULT_CONFIG_SOURCE ||= options.APP_DEFAULT_CONFIG_SOURCE;
  env.APP_PLAYER_LICENSE_KEY ||= options.APP_PLAYER_LICENSE_KEY;

  env.APP_BODY_FONT = options.APP_BODY_FONT || env.APP_BODY_FONT;
  env.APP_BODY_ALT_FONT = options.APP_BODY_ALT_FONT || env.APP_BODY_ALT_FONT;
};

export default env;
