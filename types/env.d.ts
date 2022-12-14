/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_TITLE: string | undefined;
  readonly APP_GITHUB_PUBLIC_BASE_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
