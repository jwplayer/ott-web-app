/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_TITLE: string;
  readonly APP_GITHUB_PUBLIC_BASE_URL: string;
  readonly APP_CONFIG_DEFAULT_SOURCE: string;
  readonly APP_CONFIG_ALLOWED_SOURCES: string | undefined;
  readonly APP_UNSAFE_ALLOW_DYNAMIC_CONFIG: boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
