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

  APP_FOOTER_TEXT: import.meta.env.APP_FOOTER_TEXT,
  APP_BODY_FONT: import.meta.env.APP_BODY_FONT,
  APP_BODY_ALT_FONT: import.meta.env.APP_BODY_ALT_FONT,
});

attachAccessibilityListener();

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.info('Application - rootElement not found');
}

registerSW();
