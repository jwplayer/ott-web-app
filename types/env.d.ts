/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly APP_GITHUB_PUBLIC_BASE_URL: string;
  readonly APP_UNSAFE_ALLOW_DYNAMIC_CONFIG: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
