/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_DEFAULT_CONFIG_SOURCE: string | undefined;
  readonly APP_PLAYER_ID: string | undefined;
  readonly APP_PLAYER_KEY: string | undefined;
  readonly APP_GITHUB_PUBLIC_BASE_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
