/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_DEFAULT_CONFIG_SOURCE: string | undefined;
  readonly APP_PLAYER_ID: string | undefined;
  readonly APP_PLAYER_LICENSE_KEY: string | undefined;
  readonly APP_DEFAULT_LANGUAGE: string | undefined;
  readonly APP_ENABLED_LANGUAGES: string | undefined;
  readonly APP_VERSION: string | undefined;
  readonly APP_GOOGLE_SITE_VERIFICATION_ID: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
