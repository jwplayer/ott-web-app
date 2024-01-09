import React from 'react';
import { createRoot } from 'react-dom/client';
import 'wicg-inert';
import { registerSW } from 'virtual:pwa-register';
import { configureEnv } from '@jwp/ott-common/src/env';

// @TODO: platform specific?
import '@jwp/ott-common/src/modules/register';

import App from './App';

// Collect env vars
configureEnv({
  APP_VERSION: import.meta.env.APP_VERSION,

  APP_API_BASE_URL: import.meta.env.APP_API_BASE_URL,
  APP_PLAYER_ID: import.meta.env.APP_PLAYER_ID,
});

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.info('Application - rootElement not found');
}

registerSW();
