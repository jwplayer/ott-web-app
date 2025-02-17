import 'virtual:polyfills';
import React from 'react';
import { createRoot } from 'react-dom/client';
import 'wicg-inert';
import { registerSW } from 'virtual:pwa-register';
import { configureEnv } from '@jwp/ott-common/src/env';

import './modules/register';

import App from './App';

import { attachAccessibilityListener } from '#src/utils/accessibility';

// Collect env vars
configureEnv({
  APP_VERSION: import.meta.env.APP_VERSION,

  APP_API_BASE_URL: import.meta.env.APP_API_BASE_URL,
  APP_PLAYER_ID: import.meta.env.APP_PLAYER_ID,

  APP_DEFAULT_CONFIG_SOURCE: import.meta.env.APP_DEFAULT_CONFIG_SOURCE,
  APP_PLAYER_LICENSE_KEY: import.meta.env.APP_PLAYER_LICENSE_KEY,

  APP_CONSENT_COOKIE_NAME: import.meta.env.APP_CONSENT_COOKIE_NAME,
  APP_CONSENT_COOKIE_POLICY_URL: import.meta.env.APP_CONSENT_COOKIE_POLICY_URL,

  APP_FOOTER_TEXT: import.meta.env.APP_FOOTER_TEXT,
  APP_BODY_FONT: import.meta.env.APP_BODY_FONT,
  APP_BODY_ALT_FONT: import.meta.env.APP_BODY_ALT_FONT,
  APP_PUBLIC_URL: import.meta.env.APP_PUBLIC_URL || window.location.origin,

  APP_GTM_TAG_ID: import.meta.env.APP_GTM_TAG_ID,
  APP_GTM_TAG_SERVER: import.meta.env.APP_GTM_TAG_SERVER,
  APP_GTM_LOAD_ON_ACCEPT: import.meta.env.APP_GTM_LOAD_ON_ACCEPT,
  APP_GTM_SCRIPT: import.meta.env.APP_GTM_SCRIPT,
});

attachAccessibilityListener();

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.info('Application - rootElement not found');
}

const refresh = registerSW({
  immediate: true,
  onNeedRefresh: () => refresh(true),
});
