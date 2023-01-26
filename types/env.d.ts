/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_TITLE: string | undefined;
  readonly APP_GITHUB_PUBLIC_BASE_URL: string | undefined;
  readonly APP_API_BASE_URL: string | undefined;
  readonly APP_API_BASE_URL: string | undefined;
  readonly APP_DEFAULT_PLAYER: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
