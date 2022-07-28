import { getQueryParam } from '#src/utils/history';

/**
 * Read more in /docs/environment.md
 */

export const IS_DEV_BUILD = import.meta.env.MODE === 'development';

export const IS_TEST_BUILD = import.meta.env.MODE === 'test';

export const IS_DEV_OR_TEST_BUILD = import.meta.env.DEV;

// We can use dev or prod host (dev host is used only internally by JW Player developers to test new features)
export const API_HOST = getQueryParam('env') !== 'dev' ? import.meta.env.APP_API_BASE_URL : 'https://content-portal.jwplatform.com';

// Small hack to toggle on demo environment and use its own configs
export const INCLUDE_CONFIGS = getQueryParam('env') === 'dev' ? 'dev' : import.meta.env.APP_INCLUDE_CONFIGS;

export const CONFIG_DEFAULT_SOURCE = import.meta.env.APP_CONFIG_DEFAULT_SOURCE?.toLowerCase();

export const CONFIG_ALLOWED_SOURCES = import.meta.env.APP_CONFIG_ALLOWED_SOURCES?.split(' ').map((source) => source.toLowerCase()) || [];

export const UNSAFE_ALLOW_DYNAMIC_CONFIG = import.meta.env.APP_UNSAFE_ALLOW_DYNAMIC_CONFIG;

export const GITHUB_PUBLIC_BASE_URL = import.meta.env.APP_GITHUB_PUBLIC_BASE_URL;
