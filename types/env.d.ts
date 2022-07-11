/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_TITLE: string | undefined;
  readonly APP_GITHUB_PUBLIC_BASE_URL: string | undefined;
  readonly APP_CONFIG_DEFAULT_SOURCE: string | undefined;
  readonly APP_CONFIG_ALLOWED_SOURCES: string | undefined;
  readonly APP_UNSAFE_ALLOW_DYNAMIC_CONFIG: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
